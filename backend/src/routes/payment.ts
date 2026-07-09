import { Router } from "express";
import { requireRole } from "../lib/auth.js";
import { UserRole } from "@prisma/client";
import { paymentController } from "../controllers/PaymentController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

/**
 * Payment Routes
 * Routes for handling payment-related operations (Mercado Pago checkouts)
 */
const router = Router();

// Only Super Admins and Store Owners can initiate payments
const roleMiddleware = requireRole([UserRole.SUPER_ADMIN, UserRole.STORE_OWNER]);

// Checkout preference creation for purchasing credits
router.post(
  "/purchase-credits",
  roleMiddleware,
  asyncHandler(paymentController.purchaseCredits.bind(paymentController))
);

export default router;
