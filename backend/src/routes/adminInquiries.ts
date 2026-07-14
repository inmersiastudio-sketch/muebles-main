import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth, requireRole, type AuthenticatedRequest } from '../lib/auth.js';
import { UserRole } from '@prisma/client';

const router = Router();

router.use(requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.STORE_OWNER]));

/**
 * GET /api/admin/inquiries/stats
 * Returns aggregated inquiry stats for analytics
 */
router.get('/stats', asyncHandler(async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user!;
  const storeFilter = user.role === UserRole.STORE_OWNER ? { storeId: user.storeId! } : {};

  const [total, byStatusRaw, byResultRaw, soldCount] = await Promise.all([
    prisma.productInquiry.count({ where: storeFilter }),
    prisma.productInquiry.groupBy({
      by: ['status'],
      _count: { id: true },
      where: storeFilter,
    }),
    prisma.productInquiry.groupBy({
      by: ['result'],
      _count: { id: true },
      where: { ...storeFilter, result: { not: null } },
    }),
    prisma.productInquiry.count({ where: { ...storeFilter, result: 'SOLD' } }),
  ]);

  const closed = byStatusRaw.find((s) => s.status === 'CLOSED')?._count.id ?? 0;
  const conversionRate = closed > 0 ? soldCount / closed : 0;

  const byStatus = Object.fromEntries(byStatusRaw.map((s) => [s.status, s._count.id]));
  const byResult = Object.fromEntries(
    byResultRaw.filter((r) => r.result).map((r) => [r.result!, r._count.id])
  );

  res.json({ total, byStatus, byResult, conversionRate, soldInquiries: soldCount });
}));

export default router;
