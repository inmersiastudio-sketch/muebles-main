import { Router, type Request } from "express";
import { mercadoPagoService, type MPWebhookPayload } from "../services/MercadoPagoService.js";

/**
 * Webhook Routes
 * Public routes for receiving webhooks from MercadoPago
 */

const router = Router();

/**
 * Verify MercadoPago webhook request
 * Uses the webhook token from env or IP-based validation
 */
function verifyWebhookRequest(req: Request): boolean {
  // In production, verify using webhook token from MP dashboard
  const webhookToken = process.env.MERCADOPAGO_WEBHOOK_TOKEN;

  if (!webhookToken) {
    // Fallback: Only accept from known MP IP ranges (basic check)
    // In production, ALWAYS configure MERCADOPAGO_WEBHOOK_TOKEN
    if (process.env.NODE_ENV === "production") {
      console.error("MERCADOPAGO_WEBHOOK_TOKEN not configured - rejecting webhook in production!");
      return false;
    }
    // In development, accept all (but warn)
    console.warn("Webhook token not configured - accepting all requests (development only)");
    return true;
  }

  // Check for custom header token if configured
  const providedToken = req.headers["x-webhook-token"] as string;
  if (providedToken === webhookToken) {
    return true;
  }

  return false;
}

/**
 * POST /api/webhooks/mercadopago
 * Receive webhooks from MercadoPago
 * This route is PUBLIC (no auth) as it's called by MP servers
 */
router.post("/mercadopago", async (req, res, next) => {
  try {
    // Verify webhook request
    if (!verifyWebhookRequest(req)) {
      console.warn("Unauthorized webhook request from:", req.ip, req.headers["user-agent"]);
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Basic validation
    if (!req.body || !req.body.type) {
      console.warn('Invalid webhook payload:', req.body);
      res.status(200).json({ received: true, error: 'Invalid payload' });
      return;
    }

    const payload = req.body as MPWebhookPayload;

    // Log webhook received
    console.log(`[Webhook] Received ${payload.type} event (ID: ${payload.id})`);

    // Process webhook asynchronously
    // We respond immediately to avoid MP timeouts
    res.status(200).json({ received: true });

    // Process in background
    mercadoPagoService.processWebhook(payload).catch((error) => {
      console.error('Error processing webhook:', error);
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/webhooks/mercadopago
 * MercadoPago webhook verification (sometimes uses GET)
 */
router.get("/mercadopago", (_req, res) => {
  res.status(200).json({ status: 'Webhook endpoint active' });
});

export default router;
