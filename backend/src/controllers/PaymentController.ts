import type { Request, Response } from 'express';
import { z } from 'zod';
import { mercadoPagoService } from '../services/MercadoPagoService.js';
import { Errors } from '../errors/AppError.js';
import type { AuthContext } from '../types/product.js';
import type { AuthenticatedRequest } from '../lib/auth.js';

// Schema for credit purchase request validation
const purchaseCreditsSchema = z.object({
  credits: z.number().int().positive('Credits must be a positive integer'),
  amount: z.number().positive('Amount must be a positive number'),
});

function getAuthContext(req: Request): AuthContext {
  const authReq = req as AuthenticatedRequest;
  return {
    id: authReq.user!.id,
    role: authReq.user!.role,
    storeId: authReq.user!.storeId,
  };
}

export class PaymentController {
  /**
   * POST /api/payments/purchase-credits
   * Create a checkout link for buying credits ad-hoc
   */
  async purchaseCredits(req: Request, res: Response): Promise<void> {
    // 1. Validate request body
    const parsed = purchaseCreditsSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation('Invalid payload', parsed.error.flatten());
    }

    const { credits, amount } = parsed.data;
    const user = getAuthContext(req);

    // 2. Validate store context
    if (!user.storeId) {
      throw Errors.forbidden('This user account is not associated with any store');
    }

    // 3. Initiate payment preference in Mercado Pago
    const result = await mercadoPagoService.createCreditsPreference(
      user.storeId,
      credits,
      amount
    );

    // 4. Return links and IDs
    res.status(200).json({
      success: true,
      initPoint: result.initPoint,
      preferenceId: result.preferenceId,
      purchaseId: result.purchaseId,
      message: 'Payment preference successfully created. Redirect the client to initPoint to complete purchase.',
    });
  }
}

export const paymentController = new PaymentController();
