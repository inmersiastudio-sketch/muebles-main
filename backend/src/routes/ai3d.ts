import { Router } from "express";
import { requireRole } from "../lib/auth.js";
import { UserRole } from "@prisma/client";
import { ai3dController } from "../controllers/AI3DController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

/**
 * AI 3D Generation Routes
 * Clean routing layer - delegates to AI3DController
 */

const router = Router();

// All routes require ADMIN/STORE role
const roleMiddleware = requireRole([UserRole.SUPER_ADMIN, UserRole.STORE_OWNER]);

// Generate 3D model from image
router.post("/generate", roleMiddleware, asyncHandler(ai3dController.generate.bind(ai3dController)));

// Check job status
router.get("/jobs/:jobId/status", roleMiddleware, asyncHandler(ai3dController.getStatus.bind(ai3dController)));

// Get jobs for a product
router.get("/jobs/product/:productId", roleMiddleware, asyncHandler(ai3dController.getProductJobs.bind(ai3dController)));

// Get all jobs for the store
router.get("/jobs", roleMiddleware, asyncHandler(ai3dController.getStoreJobs.bind(ai3dController)));

export default router;
