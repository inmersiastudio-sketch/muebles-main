import type { Request, Response } from 'express';
import { authService } from '../services/AuthService.js';
import { authenticateRequest, setAuthCookie, clearAuthCookie, publicUser } from '../lib/auth.js';
import {
  loginSchema,
  registerSchema,
  registerStoreSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  type RegisterStoreInput,
} from '../schemas/auth.js';
import { Errors } from '../errors/AppError.js';
import { env } from '../config/env.js';
import type { AuthUser } from '../types/auth.js';

/**
 * AuthController - HTTP Layer for Authentication
 * Handles request/response logic only, delegates to AuthService
 */

export class AuthController {
  /**
   * POST /auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation('Datos de login inválidos');
    }

    const result = await authService.login(parsed.data);
    setAuthCookie(res, result.token);
    res.json({ user: result.user, token: result.token });
  }

  /**
   * POST /auth/logout
   */
  logout(_req: Request, res: Response): void {
    clearAuthCookie(res);
    res.json({ ok: true, cleared: true });
  }

  /**
   * GET /auth/me
   */
  async me(req: Request, res: Response): Promise<void> {
    const user = await authenticateRequest(req);
    if (!user) {
      res.json({ user: null });
      return;
    }
    res.json({ user: publicUser(user as AuthUser & { role: string }) });
  }

  /**
   * POST /auth/register (admin-only)
   */
  async register(req: Request, res: Response): Promise<void> {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation('Datos inválidos', parsed.error.flatten());
    }

    const requester = await authenticateRequest(req);
    const user = await authService.register(parsed.data, requester);
    res.status(201).json({ user });
  }

  /**
   * POST /auth/register-store
   */
  async registerStore(req: Request, res: Response): Promise<void> {
    const parsed = registerStoreSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation('Datos inválidos', parsed.error.flatten());
    }

    const result = await authService.registerStore(parsed.data);
    res.status(201).json(result);
  }

  /**
   * GET /auth/verify-email
   */
  async verifyEmail(req: Request, res: Response): Promise<void> {
    const parsed = verifyEmailSchema.safeParse({ token: req.query.token });
    if (!parsed.success) {
      throw Errors.validation('Token requerido');
    }

    await authService.verifyEmail(parsed.data.token);

    // Redirect to frontend
    const siteUrl = env.SITE_URL || 'http://localhost:3000';
    res.redirect(`${siteUrl}/verificar-email?verified=1`);
  }

  /**
   * POST /auth/resend-verification
   */
  async resendVerification(req: Request, res: Response): Promise<void> {
    const parsed = resendVerificationSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation('Email requerido');
    }

    await authService.resendVerification(parsed.data.email);

    // Always return success to prevent email enumeration
    res.json({
      ok: true,
      message: 'Si el email existe y no está verificado, recibirás un nuevo enlace',
    });
  }

  /**
   * POST /auth/forgot-password
   */
  async forgotPassword(req: Request, res: Response): Promise<void> {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation('Email inválido');
    }

    await authService.forgotPassword(parsed.data.email);

    // Always return success to prevent email enumeration
    res.json({
      ok: true,
      message: 'Si el email existe, recibirás un enlace de recuperación',
    });
  }

  /**
   * POST /auth/reset-password
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation('Datos inválidos', parsed.error.flatten());
    }

    await authService.resetPassword(parsed.data);
    res.json({ ok: true, message: 'Contraseña actualizada exitosamente' });
  }
}

// Export singleton instance
export const authController = new AuthController();
