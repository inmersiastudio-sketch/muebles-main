import type { Request, Response } from 'express';
import { mercadoPagoService } from '../services/MercadoPagoService.js';
import { Errors } from '../errors/AppError.js';
import { createCheckoutSchema, planTypeSchema } from '../schemas/subscription.js';
import type { AuthenticatedRequest } from '../lib/auth.js';
import { UserRole } from '@prisma/client';

/**
 * SubscriptionController - HTTP Layer for subscription management
 */

export class SubscriptionController {
  /**
   * POST /api/subscriptions/create-checkout
   * Create a checkout link for subscription
   */
  async createCheckout(req: Request, res: Response): Promise<void> {
    const parsed = createCheckoutSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation('Invalid payload', parsed.error.flatten());
    }

    const { storeId, planType, payerEmail } = parsed.data;
    const user = (req as AuthenticatedRequest).user!;

    // Verify user has access to this store
    if (user.role === UserRole.STORE_OWNER && user.storeId !== storeId) {
      throw Errors.forbidden('Access denied to this store');
    }

    const result = await mercadoPagoService.createCheckoutLink(
      storeId,
      planType,
      payerEmail
    );

    res.json({
      success: true,
      checkoutUrl: result.checkoutUrl,
      preapprovalId: result.preapprovalId,
    });
  }

  /**
   * GET /api/subscriptions/status/:storeId
   * Get subscription status for a store
   */
  async getStatus(req: Request, res: Response): Promise<void> {
    const storeId = Number(req.params.storeId);
    if (Number.isNaN(storeId)) {
      throw Errors.validation('Invalid store ID');
    }

    const user = (req as AuthenticatedRequest).user!;

    // Verify user has access to this store
    if (user.role === UserRole.STORE_OWNER && user.storeId !== storeId) {
      throw Errors.forbidden('Access denied to this store');
    }

    const status = await mercadoPagoService.getSubscriptionStatus(storeId);

    res.json(status);
  }

  /**
   * POST /api/subscriptions/cancel
   * Cancel subscription
   */
  async cancel(req: Request, res: Response): Promise<void> {
    const { storeId } = req.body;

    if (!storeId || typeof storeId !== 'number') {
      throw Errors.validation('Store ID is required');
    }

    const user = (req as AuthenticatedRequest).user!;

    // Verify user has access to this store
    if (user.role === UserRole.STORE_OWNER && user.storeId !== storeId) {
      throw Errors.forbidden('Access denied to this store');
    }

    await mercadoPagoService.cancelSubscription(storeId);

    res.json({
      success: true,
      message: 'Subscription cancelled successfully',
    });
  }

  /**
   * GET /api/subscriptions/plans
   * Get available subscription plans
   */
  async getPlans(_req: Request, res: Response): Promise<void> {
    const plans = {
      BASIC: {
        name: 'Plan Básico',
        amount: 15000,
        currency: 'ARS',
        credits: 10,
        maxProducts: 50,
        features: [
          '10 créditos 3D mensuales',
          'Hasta 50 productos',
          'Soporte por email',
        ],
      },
      PREMIUM: {
        name: 'Plan Premium',
        amount: 35000,
        currency: 'ARS',
        credits: 30,
        maxProducts: 200,
        features: [
          '30 créditos 3D mensuales',
          'Hasta 200 productos',
          'Soporte prioritario',
          'Estadísticas avanzadas',
        ],
      },
      ENTERPRISE: {
        name: 'Plan Enterprise',
        amount: 80000,
        currency: 'ARS',
        credits: 100,
        maxProducts: 1000,
        features: [
          '100 créditos 3D mensuales',
          'Hasta 1000 productos',
          'Soporte 24/7',
          'API dedicada',
          'Onboarding personalizado',
        ],
      },
    };

    res.json({ plans });
  }
}

// Export singleton
export const subscriptionController = new SubscriptionController();
