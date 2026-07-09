import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { Errors } from '../errors/AppError.js';

const router = Router();
const prisma = new PrismaClient();

// ============================================
// SCHEMAS DE VALIDACIÓN
// ============================================

const CreateInquirySchema = z.object({
  productId: z.number().int().positive(),
  storeId: z.number().int().positive(),
  customerName: z.string().min(1, 'El nombre es requerido'),
  customerPhone: z.string().min(1, 'El teléfono es requerido'),
  customerEmail: z.string().email().optional().nullable(),
  variantId: z.string().optional().nullable(),
  message: z.string().optional().nullable(),
  productName: z.string().optional(), // Para mostrar en notificaciones
  productPrice: z.number().optional(),
});

const UpdateInquirySchema = z.object({
  status: z.enum(['NEW', 'VIEWED', 'CONTACTED', 'CLOSED']).optional(),
  result: z.enum([
    'SOLD',
    'LOST_PRICE',
    'LOST_STOCK',
    'LOST_NO_REPLY',
    'LOST_OTHER',
    'PENDING',
  ]).optional().nullable(),
  resultNote: z.string().optional().nullable(),
  finalAmount: z.number().optional().nullable(),
});

// ============================================
// ENDPOINTS PÚBLICOS (Clientes)
// ============================================

/**
 * POST /api/inquiries
 * Crear una nueva consulta (público, no requiere auth)
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const data = CreateInquirySchema.parse(req.body);

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: data.productId },
      include: { store: true },
    });

    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Verificar que el storeId coincida con el del producto
    if (product.storeId !== data.storeId) {
      return res.status(400).json({ error: 'Tienda incorrecta' });
    }

    // Crear la consulta
    const inquiry = await prisma.productInquiry.create({
      data: {
        productId: data.productId,
        storeId: data.storeId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        variantId: data.variantId,
        message: data.message,
        status: 'NEW',
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            media: {
              where: { isPrimary: true },
              take: 1,
              select: { url: true },
            },
          },
        },
        store: {
          select: {
            id: true,
            name: true,
            whatsapp: true,
          },
        },
      },
    });

    // TODO: Enviar notificación a la mueblería (email, push, etc.)

    res.status(201).json({
      success: true,
      inquiry,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: error.errors,
      });
    }
    console.error('Error creating inquiry:', error);
    res.status(500).json({ error: 'Error al crear la consulta' });
  }
});

// ============================================
// ENDPOINTS PRIVADOS (Requieren auth de tienda)
// ============================================

/**
 * GET /api/inquiries
 * Listar consultas de la tienda del usuario autenticado
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const storeId = user.storeId;
    if (!storeId) {
      return res.status(403).json({ error: 'No tienes una tienda asignada' });
    }

    // Query params
    const status = req.query.status as string | undefined;
    const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
    const page = parseInt(req.query.page as string) || 1;
    const skip = (page - 1) * limit;

    const where: any = { storeId };
    if (status && ['NEW', 'VIEWED', 'CONTACTED', 'CLOSED'].includes(status)) {
      where.status = status;
    }

    const [inquiries, total] = await Promise.all([
      prisma.productInquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
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
        },
      }),
      prisma.productInquiry.count({ where }),
    ]);

    res.json({
      inquiries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ error: 'Error al obtener consultas' });
  }
});

/**
 * GET /api/inquiries/stats
 * Estadísticas de consultas para el dashboard
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user?.storeId) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const storeId = user.storeId;

    // Obtener estadísticas
    const [
      total,
      byStatus,
      byResult,
      todayCount,
      weekCount,
    ] = await Promise.all([
      prisma.productInquiry.count({ where: { storeId } }),
      prisma.productInquiry.groupBy({
        by: ['status'],
        where: { storeId },
        _count: { status: true },
      }),
      prisma.productInquiry.groupBy({
        by: ['result'],
        where: { storeId, status: 'CLOSED' },
        _count: { result: true },
      }),
      prisma.productInquiry.count({
        where: {
          storeId,
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.productInquiry.count({
        where: {
          storeId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    // Calcular ventas totales
    const sales = await prisma.productInquiry.aggregate({
      where: {
        storeId,
        result: 'SOLD',
      },
      _sum: {
        finalAmount: true,
      },
      _count: {
        result: true,
      },
    });

    res.json({
      total,
      byStatus: byStatus.reduce((acc: any, curr: any) => {
        acc[curr.status] = curr._count.status;
        return acc;
      }, {}),
      byResult: byResult.reduce((acc: any, curr: any) => {
        acc[curr.result || 'PENDING'] = curr._count.result;
        return acc;
      }, {}),
      today: todayCount,
      thisWeek: weekCount,
      sales: {
        count: sales._count.result,
        totalAmount: sales._sum.finalAmount || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

/**
 * GET /api/inquiries/:id
 * Detalle de una consulta específica
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user?.storeId) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const inquiryId = parseInt(req.params.id);
    if (isNaN(inquiryId)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const inquiry = await prisma.productInquiry.findFirst({
      where: {
        id: inquiryId,
        storeId: user.storeId,
      },
      include: {
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
                color: true,
                size: true,
                salePrice: true,
              },
            },
          },
        },
      },
    });

    if (!inquiry) {
      return res.status(404).json({ error: 'Consulta no encontrada' });
    }

    // Si es nueva, marcarla como vista automáticamente
    if (inquiry.status === 'NEW') {
      await prisma.productInquiry.update({
        where: { id: inquiryId },
        data: { status: 'VIEWED' },
      });
      inquiry.status = 'VIEWED';
    }

    res.json(inquiry);
  } catch (error) {
    console.error('Error fetching inquiry:', error);
    res.status(500).json({ error: 'Error al obtener la consulta' });
  }
});

/**
 * PUT /api/inquiries/:id
 * Actualizar estado/resultado de una consulta
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user?.storeId) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const inquiryId = parseInt(req.params.id);
    if (isNaN(inquiryId)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const data = UpdateInquirySchema.parse(req.body);

    // Verificar que la consulta existe y pertenece a la tienda
    const existing = await prisma.productInquiry.findFirst({
      where: {
        id: inquiryId,
        storeId: user.storeId,
      },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Consulta no encontrada' });
    }

    // Si se está cerrando la consulta, agregar fecha de cierre
    const updateData: any = { ...data };
    if (data.status === 'CLOSED' && existing.status !== 'CLOSED') {
      updateData.closedAt = new Date();
    }

    const inquiry = await prisma.productInquiry.update({
      where: { id: inquiryId },
      data: updateData,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            media: {
              where: { isPrimary: true },
              take: 1,
              select: { url: true },
            },
          },
        },
      },
    });

    // Si se vendió y hay monto, actualizar estadísticas de la tienda
    if (data.result === 'SOLD' && data.finalAmount) {
      await prisma.store.update({
        where: { id: user.storeId },
        data: {
          totalSales: { increment: data.finalAmount },
        },
      });
    }

    res.json({
      success: true,
      inquiry,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Datos inválidos',
        details: error.errors,
      });
    }
    console.error('Error updating inquiry:', error);
    res.status(500).json({ error: 'Error al actualizar la consulta' });
  }
});

/**
 * POST /api/inquiries/:id/close
 * Cerrar una consulta con resultado (endpoint simplificado)
 */
router.post('/:id/close', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user?.storeId) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const inquiryId = parseInt(req.params.id);
    const { result, resultNote, finalAmount, updateStock, variantId } = req.body;

    if (!result || !['SOLD', 'LOST_PRICE', 'LOST_STOCK', 'LOST_NO_REPLY', 'LOST_OTHER', 'PENDING'].includes(result)) {
      return res.status(400).json({ error: 'Resultado inválido' });
    }

    // Cerrar la consulta
    const inquiry = await prisma.productInquiry.update({
      where: {
        id: inquiryId,
        storeId: user.storeId,
      },
      data: {
        status: 'CLOSED',
        result,
        resultNote,
        finalAmount: finalAmount ? Number(finalAmount) : null,
        closedAt: new Date(),
      },
    });

    // Si se vendió y se pidió actualizar stock
    if (result === 'SOLD' && updateStock && variantId) {
      await prisma.productVariant.update({
        where: { id: variantId },
        data: {
          stock: { decrement: 1 },
        },
      });
    }

    res.json({
      success: true,
      inquiry,
    });
  } catch (error) {
    console.error('Error closing inquiry:', error);
    res.status(500).json({ error: 'Error al cerrar la consulta' });
  }
});

/**
 * DELETE /api/inquiries/:id
 * Eliminar una consulta (soft delete lógico, solo admin)
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user?.storeId) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const inquiryId = parseInt(req.params.id);

    await prisma.productInquiry.deleteMany({
      where: {
        id: inquiryId,
        storeId: user.storeId,
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    res.status(500).json({ error: 'Error al eliminar la consulta' });
  }
});

export default router;
