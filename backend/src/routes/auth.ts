import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authController } from '../controllers/AuthController.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { requireRole } from '../lib/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Auth Routes - Clean Routing Layer
 * Only handles HTTP routing, delegates to AuthController
 * Error handling through asyncHandler middleware
 */

const router = Router();

// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 50,
  message: 'Too many login attempts, try again later',
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 5 : 20,
  message: 'Too many registration attempts, try again later',
});

// ── Routes ────────────────────────────────────────────────────

router.post('/login', loginLimiter, asyncHandler(authController.login.bind(authController)));

router.post('/logout', asyncHandler(authController.logout.bind(authController)));

router.get('/me', asyncHandler(authController.me.bind(authController)));

router.post('/register', asyncHandler(authController.register.bind(authController)));

router.post('/register-store', registerLimiter, asyncHandler(authController.registerStore.bind(authController)));

router.get('/verify-email', asyncHandler(authController.verifyEmail.bind(authController)));

router.post('/resend-verification', registerLimiter, asyncHandler(authController.resendVerification.bind(authController)));

router.post('/forgot-password', registerLimiter, asyncHandler(authController.forgotPassword.bind(authController)));

router.post('/reset-password', asyncHandler(authController.resetPassword.bind(authController)));

// ── Debug Route ───────────────────────────────────────────────

router.get('/whoami', requireRole([UserRole.SUPER_ADMIN, UserRole.STORE_OWNER]), (_req, res) => {
  // This route requires auth middleware to set req.user
  // Return user info from the middleware
  res.json({ message: 'Use /me endpoint for user info' });
});

export default router;
