import { MercadoPagoConfig, PreApproval, PreApprovalPlan, Payment, Preference } from 'mercadopago';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { Errors } from '../errors/AppError.js';
import { CreditPurchaseStatus } from '@prisma/client';

/**
 * Plan types configuration
 */
const PLANS_CONFIG = {
  BASIC: {
    name: 'Plan Básico',
    amount: 15000, // $15.000 ARS
    currency: 'ARS',
    frequency: 1,
    frequencyType: 'months' as const,
    credits: 10,
    maxProducts: 50,
  },
  PREMIUM: {
    name: 'Plan Premium',
    amount: 35000, // $35.000 ARS
    currency: 'ARS',
    frequency: 1,
    frequencyType: 'months' as const,
    credits: 30,
    maxProducts: 200,
  },
  ENTERPRISE: {
    name: 'Plan Enterprise',
    amount: 80000, // $80.000 ARS
    currency: 'ARS',
    frequency: 1,
    frequencyType: 'months' as const,
    credits: 100,
    maxProducts: 1000,
  },
};

export type PlanType = keyof typeof PLANS_CONFIG;

/**
 * Webhook event types from MercadoPago
 */
export interface MPWebhookPayload {
  action: string;
  api_version: string;
  data: {
    id: string;
  };
  date_created: string;
  id: number;
  live_mode: boolean;
  type: string;
  user_id: string;
}

// Extended Store type with new fields
type StoreWithSubscription = {
  id: number;
  name: string;
  slug: string;
  mpPreapprovalId?: string | null;
  paymentStatus?: string;
  aiCreditsLimit?: number;
  aiCreditsUsed?: number;
  planType?: string | null;
  lastPaymentDate?: Date | null;
  nextPaymentDate?: Date | null;
  storeId?: number;
};

/**
 * MercadoPagoService - Handles subscription management
 */
export class MercadoPagoService {
  private client: MercadoPagoConfig;

  constructor() {
    const accessToken = env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      console.warn('MERCADOPAGO_ACCESS_TOKEN not configured');
    }
    this.client = new MercadoPagoConfig({ 
      accessToken: accessToken || '',
      options: { timeout: 5000 }
    });
  }

  /**
   * Create a preapproval plan for a store subscription
   */
  async createPreapprovalPlan(
    storeId: number, 
    planType: PlanType,
    payerEmail: string
  ): Promise<{ initPoint: string; preapprovalPlanId: string }> {
    const config = PLANS_CONFIG[planType];
    if (!config) {
      throw Errors.validation('Invalid plan type');
    }

    // Get store info
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    }) as any;

    if (!store) {
      throw Errors.notFound('Store');
    }

    try {
      // Create preapproval plan
      const plan = new PreApprovalPlan(this.client);
      const planResponse = await plan.create({
        body: {
          reason: config.name,
          auto_recurring: {
            frequency: config.frequency,
            frequency_type: config.frequencyType,
            transaction_amount: config.amount,
            currency_id: config.currency,
          },
          back_url: `${env.SITE_URL || 'http://localhost:3000'}/admin/settings?subscription=success`,
        } as any,
      });

      // Get the init point for the user to complete subscription
      const initPoint = planResponse.init_point;
      const preapprovalPlanId = planResponse.id;

      if (!initPoint || !preapprovalPlanId) {
        throw Errors.internal('Failed to create preapproval plan');
      }

      // Update store with pending subscription info
      await prisma.store.update({
        where: { id: storeId },
        data: {
          paymentStatus: 'PENDING',
          planType: planType,
        } as any,
      });

      return {
        initPoint,
        preapprovalPlanId,
      };
    } catch (error) {
      console.error('MercadoPago createPreapprovalPlan error:', error);
      throw Errors.internal('Failed to create subscription plan');
    }
  }

  /**
   * Create a checkout link for subscription
   */
  async createCheckoutLink(
    storeId: number,
    planType: PlanType,
    payerEmail: string
  ): Promise<{ checkoutUrl: string; preapprovalId: string }> {
    const config = PLANS_CONFIG[planType];
    if (!config) {
      throw Errors.validation('Invalid plan type');
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId },
    }) as any;

    if (!store) {
      throw Errors.notFound('Store');
    }

    try {
      // Create preapproval directly
      const preapproval = new PreApproval(this.client);
      const response = await preapproval.create({
        body: {
          reason: config.name,
          external_reference: `store_${storeId}_plan_${planType}_${Date.now()}`,
          payer_email: payerEmail,
          auto_recurring: {
            frequency: config.frequency,
            frequency_type: config.frequencyType,
            transaction_amount: config.amount,
            currency_id: config.currency,
          },
          back_url: `${env.SITE_URL || 'http://localhost:3000'}/admin/settings?subscription=success`,
          status: 'pending',
        },
      });

      if (!response.id) {
        throw Errors.internal('Failed to create preapproval');
      }

      // Update store
      await prisma.store.update({
        where: { id: storeId },
        data: {
          mpPreapprovalId: response.id,
          paymentStatus: 'PENDING',
          planType: planType,
        } as any,
      });

      return {
        checkoutUrl: response.init_point || '',
        preapprovalId: response.id,
      };
    } catch (error) {
      console.error('MercadoPago createCheckoutLink error:', error);
      throw Errors.internal('Failed to create checkout link');
    }
  }

  /**
   * Create a checkout link for purchasing credits ad-hoc
   */
  async createCreditsPreference(
    storeId: number,
    credits: number,
    amount: number
  ): Promise<{ initPoint: string; preferenceId: string; purchaseId: string }> {
    // 1. Verify store exists
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      throw Errors.notFound('Store');
    }

    // 2. Create the pending CreditPurchase record
    const purchase = await prisma.creditPurchase.create({
      data: {
        storeId,
        creditsAwarded: credits,
        amount,
        status: CreditPurchaseStatus.PENDING,
        paymentGateway: 'MERCADO_PAGO',
      },
    });

    try {
      // 3. Create the Mercado Pago preference
      const preference = new Preference(this.client);
      const response = await preference.create({
        body: {
          items: [
            {
              id: `credits-${credits}-pack`,
              title: `${credits} Créditos AI 3D`,
              quantity: 1,
              unit_price: amount,
              currency_id: 'ARS',
            },
          ],
          external_reference: `store_${storeId}_credits_${credits}_purchase_${purchase.id}`,
          back_urls: {
            success: `${env.SITE_URL || 'http://localhost:3000'}/admin/billing?credits=success`,
            failure: `${env.SITE_URL || 'http://localhost:3000'}/admin/billing?credits=failure`,
            pending: `${env.SITE_URL || 'http://localhost:3000'}/admin/billing?credits=pending`,
          },
          auto_return: 'approved',
          notification_url: `${env.API_BASE_URL || 'http://localhost:3001'}/api/webhooks/mercadopago`,
        },
      });

      const initPoint = response.init_point;
      const preferenceId = response.id;

      if (!initPoint || !preferenceId) {
        throw Errors.internal('Failed to create MercadoPago preference');
      }

      // 4. Update the record with the preference ID as gatewayRef
      await prisma.creditPurchase.update({
        where: { id: purchase.id },
        data: {
          gatewayRef: preferenceId,
        },
      });

      return {
        initPoint,
        preferenceId,
        purchaseId: purchase.id,
      };
    } catch (error) {
      console.error('MercadoPago createCreditsPreference error:', error);
      // Mark as failed
      await prisma.creditPurchase.update({
        where: { id: purchase.id },
        data: {
          status: CreditPurchaseStatus.FAILED,
        },
      });
      throw Errors.internal('Failed to create credits payment preference');
    }
  }

  /**
   * Process webhook from MercadoPago
   * This is called when MP notifies us of a payment event
   */
  async processWebhook(payload: MPWebhookPayload): Promise<void> {
    console.log('Processing MP webhook:', { type: payload.type, action: payload.action });

    try {
      // Only process payment and preapproval events
      if (!payload.type.includes('payment') && !payload.type.includes('preapproval')) {
        console.log('Ignoring non-payment webhook:', payload.type);
        return;
      }

      // Get detailed payment info if it's a payment
      if (payload.type === 'payment' && payload.data?.id) {
        await this.processPaymentNotification(payload.data.id);
      }

      // Handle preapproval events
      if (payload.type.includes('preapproval') && payload.data?.id) {
        await this.processPreapprovalNotification(payload.data.id, payload.action);
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      // Log the error but don't throw - we need to return 200 to MP
      await this.logSubscriptionEvent(
        0, // unknown store
        'WEBHOOK_ERROR',
        payload.data?.id || '',
        '',
        0,
        'ARS',
        error instanceof Error ? error.message : 'Unknown error',
        payload
      );
    }
  }

  /**
   * Process a payment notification
   */
  private async processPaymentNotification(paymentId: string): Promise<void> {
    try {
      const payment = new Payment(this.client);
      const paymentData = await payment.get({ id: paymentId });

      if (!paymentData.id) {
        console.warn('Payment not found:', paymentId);
        return;
      }

      const status = paymentData.status;
      const externalRef = paymentData.external_reference || '';
      
      // Check if this is a credit purchase payment
      if (externalRef.includes('_credits_')) {
        // Format: store_{storeId}_credits_{credits}_purchase_{purchaseId}
        const match = externalRef.match(/store_(\d+)_credits_(\d+)_purchase_(.+)/);
        if (!match) {
          console.warn('Invalid credits external reference format:', externalRef);
          return;
        }

        const storeId = parseInt(match[1], 10);
        const credits = parseInt(match[2], 10);
        const purchaseId = match[3];

        const purchase = await prisma.creditPurchase.findUnique({
          where: { id: purchaseId },
        });

        if (!purchase) {
          console.warn('Credit purchase record not found for webhook:', purchaseId);
          return;
        }

        if (purchase.status !== CreditPurchaseStatus.PENDING) {
          console.log(`Credit purchase ${purchaseId} already processed with status: ${purchase.status}`);
          return;
        }

        if (status === 'approved') {
          // Acreditación transaccional
          await prisma.$transaction(async (tx) => {
            await tx.creditPurchase.update({
              where: { id: purchaseId },
              data: {
                status: CreditPurchaseStatus.APPROVED,
                gatewayRef: paymentId,
              },
            });

            await tx.store.update({
              where: { id: storeId },
              data: {
                ai3dCredits: { increment: credits },
              },
            });
          });

          console.log(`Successfully credited ${credits} credits to store ${storeId}. Purchase ID: ${purchaseId}`);
        } else {
          const finalStatus = status === 'rejected' ? CreditPurchaseStatus.REJECTED : CreditPurchaseStatus.FAILED;
          await prisma.creditPurchase.update({
            where: { id: purchaseId },
            data: {
              status: finalStatus,
              gatewayRef: paymentId,
            },
          });
          console.log(`Credit purchase ${purchaseId} updated to ${finalStatus} (MP status: ${status})`);
        }

        return;
      }

      // Parse external reference for subscription
      // Format: store_{storeId}_plan_{planType}_{timestamp}
      const match = externalRef.match(/store_(\d+)_plan_(\w+)/);
      if (!match) {
        console.warn('Invalid external reference format:', externalRef);
        return;
      }

      const storeId = parseInt(match[1], 10);
      const planType = match[2] as PlanType;

      const store = await prisma.store.findUnique({
        where: { id: storeId },
      }) as StoreWithSubscription | null;

      if (!store) {
        console.warn('Store not found for payment:', storeId);
        return;
      }

      // Log the event
      await this.logSubscriptionEvent(
        storeId,
        status === 'approved' ? 'PAYMENT_APPROVED' : 'PAYMENT_REJECTED',
        paymentId,
        store.mpPreapprovalId || '',
        paymentData.transaction_amount || 0,
        paymentData.currency_id || 'ARS',
        status || 'unknown',
        paymentData
      );

      // Process approved payment
      if (status === 'approved') {
        await this.activateSubscription(store, planType, paymentId);
      }
    } catch (error) {
      console.error('Error processing payment notification:', error);
      throw error;
    }
  }

  /**
   * Process a preapproval notification
   */
  private async processPreapprovalNotification(preapprovalId: string, action: string): Promise<void> {
    try {
      const preapproval = new PreApproval(this.client);
      const preapprovalData = await preapproval.get({ id: preapprovalId });

      if (!preapprovalData.id) {
        console.warn('Preapproval not found:', preapprovalId);
        return;
      }

      // Find store by preapproval ID
      const store = await prisma.store.findFirst({
        where: { mpPreapprovalId: preapprovalId } as any,
      }) as any;

      if (!store) {
        console.warn('Store not found for preapproval:', preapprovalId);
        return;
      }

      const status = preapprovalData.status;

      // Log the event
      await this.logSubscriptionEvent(
        store.id,
        action === 'updated' ? 'SUBSCRIPTION_UPDATED' : 'SUBSCRIPTION_CANCELLED',
        '',
        preapprovalId,
        preapprovalData.auto_recurring?.transaction_amount || 0,
        preapprovalData.auto_recurring?.currency_id || 'ARS',
        status || 'unknown',
        preapprovalData
      );

      // Handle status changes
      if (status === 'cancelled') {
        await this.deactivateSubscription(store);
      } else if (status === 'authorized') {
        // Subscription is active
        await prisma.store.update({
          where: { id: store.id },
          data: {
            paymentStatus: 'ACTIVE',
          } as any,
        });
      }
    } catch (error) {
      console.error('Error processing preapproval notification:', error);
      throw error;
    }
  }

  /**
   * Activate subscription and grant credits
   */
  private async activateSubscription(
    store: StoreWithSubscription,
    planType: PlanType,
    paymentId: string
  ): Promise<void> {
    const config = PLANS_CONFIG[planType];
    if (!config) {
      console.warn('Invalid plan type for activation:', planType);
      return;
    }

    // Update store with active subscription and credits
    await prisma.store.update({
      where: { id: store.id },
      data: {
        paymentStatus: 'ACTIVE',
        planType: planType,
        aiCreditsLimit: config.credits,
        aiCreditsUsed: 0, // Reset used credits
        maxProducts: config.maxProducts,
        lastPaymentDate: new Date(),
        nextPaymentDate: this.calculateNextPaymentDate(),
      } as any,
    });

    console.log(`Subscription activated for store ${store.id}: ${planType} with ${config.credits} credits`);
  }

  /**
   * Deactivate subscription
   */
  private async deactivateSubscription(store: StoreWithSubscription): Promise<void> {
    await prisma.store.update({
      where: { id: store.id },
      data: {
        paymentStatus: 'CANCELLED',
        planType: 'FREE',
        aiCreditsLimit: 0, // Reset to free tier
        maxProducts: 10, // Reset to free tier
      } as any,
    });

    console.log(`Subscription deactivated for store ${store.id}`);
  }

  /**
   * Calculate next payment date (1 month from now)
   */
  private calculateNextPaymentDate(): Date {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
  }

  /**
   * Log subscription event
   */
  private async logSubscriptionEvent(
    storeId: number,
    eventType: string,
    mpPaymentId: string,
    mpPreapprovalId: string,
    amount: number,
    currency: string,
    status: string,
    metadata: unknown
  ): Promise<void> {
    try {
      await (prisma as any).subscriptionLog.create({
        data: {
          storeId,
          eventType,
          mpPaymentId,
          mpPreapprovalId,
          amount,
          currency,
          status,
          metadata: metadata as Record<string, unknown>,
        },
      });
    } catch (error) {
      console.error('Failed to log subscription event:', error);
    }
  }

  /**
   * Get subscription status for a store
   */
  async getSubscriptionStatus(storeId: number): Promise<{
    status: string;
    planType: string | null;
    creditsLimit: number;
    creditsUsed: number;
    creditsRemaining: number;
    nextPaymentDate: Date | null;
    ai3dCredits: number;
    ai3dUsed: number;
  }> {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: {
        paymentStatus: true,
        planType: true,
        aiCreditsLimit: true,
        aiCreditsUsed: true,
        nextPaymentDate: true,
        ai3dCredits: true,
        ai3dUsed: true,
      },
    });

    if (!store) {
      throw Errors.notFound('Store');
    }

    return {
      status: store.paymentStatus || 'INACTIVE',
      planType: store.planType || null,
      creditsLimit: store.aiCreditsLimit || 0,
      creditsUsed: store.aiCreditsUsed || 0,
      creditsRemaining: (store.aiCreditsLimit || 0) - (store.aiCreditsUsed || 0),
      nextPaymentDate: store.nextPaymentDate || null,
      ai3dCredits: store.ai3dCredits || 0,
      ai3dUsed: store.ai3dUsed || 0,
    };
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(storeId: number): Promise<void> {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    }) as StoreWithSubscription | null;

    if (!store) {
      throw Errors.notFound('Store');
    }

    if (!store.mpPreapprovalId) {
      throw Errors.validation('No active subscription found');
    }

    try {
      // Cancel in MercadoPago
      const preapproval = new PreApproval(this.client);
      await preapproval.update({
        id: store.mpPreapprovalId,
        body: {
          status: 'cancelled',
        },
      });

      // Update store
      await this.deactivateSubscription(store);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw Errors.internal('Failed to cancel subscription');
    }
  }

  /**
   * Use credits for 3D generation
   */
  async useCredit(storeId: number): Promise<{ success: boolean; remaining: number }> {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: {
        aiCreditsLimit: true,
        aiCreditsUsed: true,
        paymentStatus: true,
      } as any,
    }) as any;

    if (!store) {
      throw Errors.notFound('Store');
    }

    const remaining = (store.aiCreditsLimit || 0) - (store.aiCreditsUsed || 0);

    if (remaining <= 0) {
      return { success: false, remaining: 0 };
    }

    // Increment used credits
    await prisma.store.update({
      where: { id: storeId },
      data: {
        aiCreditsUsed: { increment: 1 },
      } as any,
    });

    return { success: true, remaining: remaining - 1 };
  }
}

// Export singleton
export const mercadoPagoService = new MercadoPagoService();
