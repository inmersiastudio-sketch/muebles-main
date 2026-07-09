import { z } from 'zod';

/**
 * Subscription Zod Schemas
 */

export const planTypeSchema = z.enum(['BASIC', 'PREMIUM', 'ENTERPRISE']);

export const createCheckoutSchema = z.object({
  storeId: z.number(),
  planType: planTypeSchema,
  payerEmail: z.string().email(),
});

export const webhookPayloadSchema = z.object({
  action: z.string(),
  api_version: z.string(),
  data: z.object({
    id: z.string(),
  }),
  date_created: z.string(),
  id: z.number(),
  live_mode: z.boolean(),
  type: z.string(),
  user_id: z.string(),
});

export const cancelSubscriptionSchema = z.object({
  storeId: z.number(),
});

// Type exports
export type PlanType = z.infer<typeof planTypeSchema>;
export type CreateCheckoutInput = z.infer<typeof createCheckoutSchema>;
export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;
export type CancelSubscriptionInput = z.infer<typeof cancelSubscriptionSchema>;
