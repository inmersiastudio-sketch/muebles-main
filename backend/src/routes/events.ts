import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { type Prisma } from '@prisma/client';
import { z } from 'zod';
import { Errors } from '../errors/AppError.js';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();

const arViewLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: 'Too many AR events, slow down',
});

const ArViewSchema = z.object({
  productId: z.coerce.number().int().positive().optional(),
  slug: z.string().trim().min(1).max(180).optional(),
  source: z.string().trim().min(1).max(80).optional(),
  sessionId: z.string().trim().min(8).max(128).optional(),
  device: z.string().trim().min(1).max(80).optional(),
  country: z.string().trim().min(2).max(80).optional(),
}).superRefine((event, context) => {
  if (!event.productId && !event.slug) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['productId'],
      message: 'productId or slug is required',
    });
  }
});

/**
 * POST /api/events/ar-view
 * Records a validated AR product view without trusting a client-provided store id.
 */
router.post('/ar-view', arViewLimiter, asyncHandler(async (req, res) => {
  const event = ArViewSchema.parse(req.body);
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(event.productId ? { id: event.productId } : {}),
    ...(event.slug ? { slug: event.slug } : {}),
  };

  const product = await prisma.product.findFirst({
    where,
    select: { id: true },
  });

  if (!product) {
    throw Errors.notFound('Producto');
  }

  const created = await prisma.productView.create({
    data: {
      productId: product.id,
      sessionId: event.sessionId ?? `ar-${randomUUID()}`,
      source: event.source?.toUpperCase() ?? 'AR',
      device: event.device,
      country: event.country,
    },
    select: {
      id: true,
      productId: true,
      createdAt: true,
    },
  });

  res.status(201).json({
    success: true,
    data: { event: created },
    // Kept for callers of the original endpoint.
    ok: true,
    event: created,
  });
}));

export default router;
