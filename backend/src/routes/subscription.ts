import { Router } from "express";
import { requireAuth, requireRole } from "../lib/auth.js";
import { subscriptionController } from "../controllers/SubscriptionController.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { UserRole } from "@prisma/client";

/**
 * Subscription Routes
 * Protected routes for subscription management
 */

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Create checkout link for subscription
router.post(
  "/create-checkout",
  requireRole([UserRole.SUPER_ADMIN, UserRole.STORE_OWNER]),
  asyncHandler(subscriptionController.createCheckout.bind(subscriptionController))
);

// Get subscription status
router.get(
  "/status/:storeId",
  requireRole([UserRole.SUPER_ADMIN, UserRole.STORE_OWNER]),
  asyncHandler(subscriptionController.getStatus.bind(subscriptionController))
);

// Cancel subscription
router.post(
  "/cancel",
  requireRole([UserRole.SUPER_ADMIN, UserRole.STORE_OWNER]),
  asyncHandler(subscriptionController.cancel.bind(subscriptionController))
);

// Get available plans (public)
router.get("/plans", asyncHandler(subscriptionController.getPlans.bind(subscriptionController)));

export default router;
