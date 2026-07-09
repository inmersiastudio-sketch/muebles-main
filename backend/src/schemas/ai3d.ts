import { z } from 'zod';

/**
 * AI 3D Generation Zod Schemas
 */

export const generate3DSchema = z.object({
  productId: z.number(),
  imageUrl: z.string().url().optional(),
  imageUrls: z.array(z.string().url()).optional(),
  provider: z.enum(['meshy', 'tripo']).default('tripo'),
});

export const jobIdParamSchema = z.object({
  jobId: z.string().uuid(),
});

export const productIdParamSchema = z.object({
  productId: z.string().regex(/^\d+$/).transform(Number),
});

// Type exports
export type Generate3DInput = z.infer<typeof generate3DSchema>;
