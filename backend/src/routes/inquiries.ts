import { Router, type Response } from 'express';
import {
  InquiryResult,
  InquiryStatus,
  type Prisma,
  UserRole,
} from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import {
  CloseInquirySchema,
  CreateInquirySchema,
  InquiryIdParamSchema,
  InquiryListQuerySchema,
  InquiryStatsQuerySchema,
  UpdateInquirySchema,
  closureInquiryResults,
  type CloseInquiryInput,
  type InquiryListQuery,
  type UpdateInquiryInput,
} from '../schemas/inquiry.js';
import {
  requireAuth,
  requireRole,
  type AuthenticatedRequest,
  type AuthUser,
} from '../lib/auth.js';
import { Errors } from '../errors/AppError.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getInquiryOperationalStats } from '../services/InquiryAnalyticsService.js';

const router = Router();

const OPEN_STATUSES = [
  InquiryStatus.NEW,
  InquiryStatus.VIEWED,
  InquiryStatus.CONTACTED,
];

const LOSS_RESULTS = [
  InquiryResult.LOST_PRICE,
  InquiryResult.LOST_STOCK,
  InquiryResult.LOST_NO_REPLY,
  InquiryResult.LOST_OTHER,
];

const allowedTransitions: Record<InquiryStatus, readonly InquiryStatus[]> = {
  [InquiryStatus.NEW]: [InquiryStatus.VIEWED, InquiryStatus.CONTACTED, InquiryStatus.CLOSED],
  [InquiryStatus.VIEWED]: [InquiryStatus.CONTACTED, InquiryStatus.CLOSED],
  [InquiryStatus.CONTACTED]: [InquiryStatus.CLOSED],
  [InquiryStatus.CLOSED]: [],
};

const inquiryListInclude = {
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      category: true,
      media: {
        where: { isPrimary: true },
        take: 1,
        select: { url: true },
      },
    },
  },
  variant: {
    select: {
      id: true,
      name: true,
      sku: true,
      color: true,
      size: true,
      salePrice: true,
    },
  },
  store: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} satisfies Prisma.ProductInquiryInclude;

const inquiryDetailInclude = {
  product: {
    include: {
      media: {
        where: { type: 'IMAGE' },
        take: 5,
        select: { url: true, isPrimary: true },
      },
      variants: {
        select: {
          id: true,
          name: true,
          sku: true,
          color: true,
          size: true,
          salePrice: true,
          stock: true,
        },
      },
    },
  },
  variant: {
    select: {
      id: true,
      name: true,
      sku: true,
      color: true,
      size: true,
      salePrice: true,
      stock: true,
    },
  },
  store: {
    select: {
      id: true,
      name: true,
      slug: true,
      whatsapp: true,
    },
  },
} satisfies Prisma.ProductInquiryInclude;

type ApiSuccess<T> = {
  success: true;
  data: T;
};

function sendSuccess<T, TLegacy extends Record<string, unknown> = Record<string, never>>(
  res: Response,
  status: number,
  data: T,
  legacy?: TLegacy,
) {
  const response: ApiSuccess<T> & TLegacy = {
    success: true,
    data,
    ...(legacy ?? ({} as TLegacy)),
  };

  return res.status(status).json(response);
}

function getAuthenticatedUser(req: AuthenticatedRequest): AuthUser {
  if (!req.user) {
    throw Errors.unauthorized();
  }

  return req.user;
}

function getStoreScope(user: AuthUser, requestedStoreId?: number): Prisma.ProductInquiryWhereInput {
  if (user.role === UserRole.STORE_OWNER) {
    if (!user.storeId) {
      throw Errors.forbidden('No tienes una tienda asignada');
    }

    if (requestedStoreId && requestedStoreId !== user.storeId) {
      throw Errors.forbidden('No puedes acceder a consultas de otra tienda');
    }

    return { storeId: user.storeId };
  }

  if (user.role === UserRole.SUPER_ADMIN) {
    return requestedStoreId ? { storeId: requestedStoreId } : {};
  }

  throw Errors.forbidden('No tienes permisos para gestionar consultas');
}

function assertStatusTransition(currentStatus: InquiryStatus, nextStatus: InquiryStatus) {
  if (currentStatus === nextStatus) {
    return;
  }

  if (!allowedTransitions[currentStatus].includes(nextStatus)) {
    throw Errors.conflict(`No se puede cambiar una consulta de ${currentStatus} a ${nextStatus}`);
  }
}

function validateInquiryMutation(
  existing: { status: InquiryStatus; result: InquiryResult | null; finalAmount: number | null },
  update: UpdateInquiryInput,
) {
  const nextStatus = update.status ?? existing.status;
  const nextResult = update.result === undefined ? existing.result : update.result;
  const nextFinalAmount = update.finalAmount === undefined ? existing.finalAmount : update.finalAmount;

  assertStatusTransition(existing.status, nextStatus);

  if (nextStatus !== InquiryStatus.CLOSED) {
    if (update.result !== undefined || update.finalAmount !== undefined) {
      throw Errors.validation('El resultado y el monto final solo se registran al cerrar la consulta');
    }
    return;
  }

  const isFirstClose = existing.status !== InquiryStatus.CLOSED && nextStatus === InquiryStatus.CLOSED;
  if (isFirstClose && (!nextResult || nextResult === InquiryResult.PENDING)) {
    throw Errors.validation('El cierre requiere un resultado final');
  }

  if (update.result !== undefined && (!nextResult || nextResult === InquiryResult.PENDING)) {
    throw Errors.validation('PENDING no es un resultado valido para una consulta cerrada');
  }

  const isChangingCommercialOutcome = update.result !== undefined || update.finalAmount !== undefined || isFirstClose;
  if (!isChangingCommercialOutcome) {
    return;
  }

  if (nextResult === InquiryResult.SOLD && (!nextFinalAmount || nextFinalAmount <= 0)) {
    throw Errors.validation('Una venta cerrada requiere un monto final positivo');
  }

  if (nextResult && nextResult !== InquiryResult.SOLD && nextFinalAmount !== null) {
    throw Errors.validation('Solo las consultas vendidas pueden tener un monto final');
  }
}

function toUpdateData(
  existing: { status: InquiryStatus },
  update: UpdateInquiryInput,
): Prisma.ProductInquiryUpdateInput {
  const data: Prisma.ProductInquiryUpdateInput = {};

  if (update.status) {
    data.status = update.status;
    if (existing.status !== InquiryStatus.CLOSED && update.status === InquiryStatus.CLOSED) {
      data.closedAt = new Date();
    }
  }

  if (update.result !== undefined) {
    data.result = update.result;
  }

  if (update.resultNote !== undefined) {
    data.resultNote = update.resultNote;
  }

  if (update.finalAmount !== undefined) {
    data.finalAmount = update.finalAmount;
  } else if (update.result !== undefined && update.result !== InquiryResult.SOLD) {
    data.finalAmount = null;
  }

  return data;
}

function buildListWhere(
  user: AuthUser,
  query: InquiryListQuery,
): Prisma.ProductInquiryWhereInput {
  const filters: Prisma.ProductInquiryWhereInput[] = [getStoreScope(user, query.storeId)];

  if (query.status && query.status !== 'all') {
    if (query.status === 'pending') {
      filters.push({ status: { in: OPEN_STATUSES } });
    } else if (query.status === 'converted') {
      filters.push({ status: InquiryStatus.CLOSED, result: InquiryResult.SOLD });
    } else if (query.status === 'lost') {
      filters.push({ status: InquiryStatus.CLOSED, result: { in: LOSS_RESULTS } });
    } else {
      filters.push({ status: query.status });
    }
  }

  if (query.result) {
    filters.push({ result: query.result });
  }

  if (query.productId) {
    filters.push({ productId: query.productId });
  }

  if (query.variantId) {
    filters.push({ variantId: query.variantId });
  }

  if (query.search) {
    filters.push({
      OR: [
        { customerName: { contains: query.search, mode: 'insensitive' } },
        { customerPhone: { contains: query.search, mode: 'insensitive' } },
        { customerEmail: { contains: query.search, mode: 'insensitive' } },
        { product: { name: { contains: query.search, mode: 'insensitive' } } },
      ],
    });
  }

  if (query.dateFrom || query.dateTo) {
    filters.push({
      createdAt: {
        ...(query.dateFrom ? { gte: query.dateFrom } : {}),
        ...(query.dateTo ? { lte: query.dateTo } : {}),
      },
    });
  }

  if (query.closedFrom || query.closedTo) {
    filters.push({
      closedAt: {
        ...(query.closedFrom ? { gte: query.closedFrom } : {}),
        ...(query.closedTo ? { lte: query.closedTo } : {}),
      },
    });
  }

  return filters.length === 1 ? filters[0] : { AND: filters };
}

function listOrderBy(query: InquiryListQuery): Prisma.ProductInquiryOrderByWithRelationInput {
  if (query.sortBy === 'updatedAt') {
    return { updatedAt: query.sortOrder };
  }

  if (query.sortBy === 'closedAt') {
    return { closedAt: query.sortOrder };
  }

  return { createdAt: query.sortOrder };
}

function resolveCloseResult(input: CloseInquiryInput): InquiryResult {
  if (input.result) {
    if (!closureInquiryResults.includes(input.result as (typeof closureInquiryResults)[number])) {
      throw Errors.validation('El resultado de cierre no es valido');
    }
    return input.result;
  }

  if (input.outcome === 'converted') {
    return InquiryResult.SOLD;
  }

  switch (input.lossReason) {
    case 'too_expensive':
      return InquiryResult.LOST_PRICE;
    case 'no_stock':
      return InquiryResult.LOST_STOCK;
    case 'no_response':
      return InquiryResult.LOST_NO_REPLY;
    default:
      return InquiryResult.LOST_OTHER;
  }
}

/**
 * POST /api/inquiries
 * Registers a customer inquiry. The product determines the target store.
 */
router.post('/', asyncHandler(async (req, res) => {
  const data = CreateInquirySchema.parse(req.body);

  const product = await prisma.product.findUnique({
    where: { id: data.productId },
    select: {
      id: true,
      storeId: true,
      isActive: true,
      store: { select: { isActive: true } },
    },
  });

  if (!product || !product.isActive || !product.store.isActive) {
    throw Errors.notFound('Producto');
  }

  if (data.storeId && data.storeId !== product.storeId) {
    throw Errors.validation('La tienda indicada no corresponde al producto');
  }

  if (data.variantId) {
    const variant = await prisma.productVariant.findFirst({
      where: { id: data.variantId, productId: product.id },
      select: { id: true },
    });

    if (!variant) {
      throw Errors.validation('La variante no corresponde al producto');
    }
  }

  const inquiry = await prisma.$transaction(async (tx) => {
    const created = await tx.productInquiry.create({
      data: {
        productId: product.id,
        storeId: product.storeId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        variantId: data.variantId,
        message: data.message,
      },
      include: inquiryListInclude,
    });

    await tx.product.update({
      where: { id: product.id },
      data: { inquiryCount: { increment: 1 } },
    });

    return created;
  });

  sendSuccess(res, 201, inquiry, { inquiry });
}));

// All remaining inquiry operations require a store operator or platform administrator.
router.use(requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.STORE_OWNER]));

/**
 * GET /api/inquiries
 * Lists inquiries within the authenticated user's authorized store scope.
 */
router.get('/', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const user = getAuthenticatedUser(req);
  const query = InquiryListQuerySchema.parse(req.query);
  const where = buildListWhere(user, query);
  const skip = (query.page - 1) * query.limit;

  const [inquiries, total] = await Promise.all([
    prisma.productInquiry.findMany({
      where,
      include: inquiryListInclude,
      orderBy: [listOrderBy(query), { id: 'desc' }],
      skip,
      take: query.limit,
    }),
    prisma.productInquiry.count({ where }),
  ]);

  const pagination = {
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / query.limit)),
  };

  sendSuccess(res, 200, { inquiries, pagination }, { inquiries, pagination });
}));

/**
 * GET /api/inquiries/stats
 * Returns workload, funnel and revenue metrics for the authorized store scope.
 */
router.get('/stats', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const user = getAuthenticatedUser(req);
  const query = InquiryStatsQuerySchema.parse(req.query);
  const stats = await getInquiryOperationalStats(getStoreScope(user, query.storeId));

  sendSuccess(res, 200, stats, stats);
}));

/**
 * GET /api/inquiries/:id
 * Returns the inquiry detail and marks a new inquiry as viewed.
 */
router.get('/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const user = getAuthenticatedUser(req);
  const { id } = InquiryIdParamSchema.parse(req.params);
  const where: Prisma.ProductInquiryWhereInput = {
    id,
    ...getStoreScope(user),
  };

  const inquiry = await prisma.productInquiry.findFirst({
    where,
    include: inquiryDetailInclude,
  });

  if (!inquiry) {
    throw Errors.notFound('Consulta');
  }

  const visibleInquiry = inquiry.status === InquiryStatus.NEW
    ? await prisma.productInquiry.update({
      where: { id: inquiry.id },
      data: { status: InquiryStatus.VIEWED },
      include: inquiryDetailInclude,
    })
    : inquiry;

  // Spreading the resource keeps the previous detail response readable by existing clients.
  sendSuccess(res, 200, visibleInquiry, visibleInquiry);
}));

async function updateInquiry(
  id: number,
  user: AuthUser,
  update: UpdateInquiryInput,
) {
  const existing = await prisma.productInquiry.findFirst({
    where: { id, ...getStoreScope(user) },
    select: {
      id: true,
      status: true,
      result: true,
      finalAmount: true,
    },
  });

  if (!existing) {
    throw Errors.notFound('Consulta');
  }

  validateInquiryMutation(existing, update);

  return prisma.productInquiry.update({
    where: { id },
    data: toUpdateData(existing, update),
    include: inquiryListInclude,
  });
}

/**
 * PUT/PATCH /api/inquiries/:id
 * Applies a valid lifecycle transition or updates the closing outcome.
 */
const updateInquiryHandler = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const user = getAuthenticatedUser(req);
  const { id } = InquiryIdParamSchema.parse(req.params);
  const update = UpdateInquirySchema.parse(req.body);
  const inquiry = await updateInquiry(id, user, update);

  sendSuccess(res, 200, inquiry, { inquiry });
});

router.put('/:id', updateInquiryHandler);
router.patch('/:id', updateInquiryHandler);

/**
 * POST/PATCH /api/inquiries/:id/close
 * Closes an inquiry with a final result. Inventory changes are explicit and atomic.
 */
const closeInquiryHandler = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const user = getAuthenticatedUser(req);
  const { id } = InquiryIdParamSchema.parse(req.params);
  const input = CloseInquirySchema.parse(req.body);
  const result = resolveCloseResult(input);

  const existing = await prisma.productInquiry.findFirst({
    where: { id, ...getStoreScope(user) },
    select: {
      id: true,
      productId: true,
      variantId: true,
      status: true,
      result: true,
      finalAmount: true,
    },
  });

  if (!existing) {
    throw Errors.notFound('Consulta');
  }

  if (existing.status === InquiryStatus.CLOSED) {
    throw Errors.conflict('La consulta ya fue cerrada');
  }

  if (input.updateStock && result !== InquiryResult.SOLD) {
    throw Errors.validation('Solo una venta cerrada puede actualizar stock');
  }

  const update: UpdateInquiryInput = {
    status: InquiryStatus.CLOSED,
    result,
    resultNote: input.resultNote ?? input.notes ?? input.lossReason,
    finalAmount: input.finalAmount,
  };
  validateInquiryMutation(existing, update);

  const stockVariantId = input.variantId ?? existing.variantId;
  if (input.updateStock && !stockVariantId) {
    throw Errors.validation('Se requiere una variante para actualizar stock');
  }

  const inquiry = await prisma.$transaction(async (tx) => {
    if (input.updateStock && stockVariantId) {
      const stockUpdate = await tx.productVariant.updateMany({
        where: {
          id: stockVariantId,
          productId: existing.productId,
          stock: { gte: 1 },
        },
        data: { stock: { decrement: 1 } },
      });

      if (stockUpdate.count !== 1) {
        throw Errors.conflict('La variante no existe o no tiene stock disponible');
      }
    }

    return tx.productInquiry.update({
      where: { id: existing.id },
      data: toUpdateData(existing, update),
      include: inquiryListInclude,
    });
  });

  sendSuccess(res, 200, inquiry, { inquiry });
});

router.post('/:id/close', closeInquiryHandler);
router.patch('/:id/close', closeInquiryHandler);

/**
 * DELETE /api/inquiries/:id
 * Hard deletion is restricted to platform administrators because the schema has no soft-delete field.
 */
router.delete('/:id', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const user = getAuthenticatedUser(req);
  if (user.role !== UserRole.SUPER_ADMIN) {
    throw Errors.forbidden('Solo un administrador puede eliminar consultas');
  }

  const { id } = InquiryIdParamSchema.parse(req.params);
  const existing = await prisma.productInquiry.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw Errors.notFound('Consulta');
  }

  await prisma.productInquiry.delete({ where: { id } });
  res.status(204).send();
}));

export default router;
