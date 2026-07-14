import { Router } from 'express';
import { UserRole, type Prisma } from '@prisma/client';
import { Errors } from '../errors/AppError.js';
import { requireAuth, requireRole, type AuthenticatedRequest } from '../lib/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { InquiryStatsQuerySchema } from '../schemas/inquiry.js';
import { getInquiryOperationalStats } from '../services/InquiryAnalyticsService.js';

const router = Router();

router.use(requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.STORE_OWNER]));

function getStatsScope(
  req: AuthenticatedRequest,
  requestedStoreId?: number,
): Prisma.ProductInquiryWhereInput {
  const user = req.user!;

  if (user.role === UserRole.STORE_OWNER) {
    if (!user.storeId) {
      throw Errors.forbidden('No tienes una tienda asignada');
    }

    if (requestedStoreId && requestedStoreId !== user.storeId) {
      throw Errors.forbidden('No puedes consultar metricas de otra tienda');
    }

    return { storeId: user.storeId };
  }

  return requestedStoreId ? { storeId: requestedStoreId } : {};
}

/**
 * GET /api/admin/inquiries/stats?storeId=:storeId
 * Platform admins can aggregate all stores or filter one. Store owners are always store-scoped.
 */
router.get('/stats', asyncHandler(async (req: AuthenticatedRequest, res) => {
  const query = InquiryStatsQuerySchema.parse(req.query);
  const stats = await getInquiryOperationalStats(getStatsScope(req, query.storeId));

  // The top-level fields preserve the existing analytics contract while data is the canonical envelope.
  res.json({ success: true, data: stats, ...stats });
}));

export default router;
