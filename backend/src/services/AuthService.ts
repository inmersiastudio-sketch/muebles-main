import crypto from 'crypto';
import { UserRole } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { env } from '../config/env.js';
import { Errors } from '../errors/AppError.js';
import {
  hashPassword,
  verifyPassword,
  signUser,
  publicUser,
} from '../lib/auth.js';
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from '../lib/email.js';
import type {
  AuthUser,
  PublicUser,
  RegistrationResult,
} from '../types/auth.js';
import type { LoginInput, RegisterInput, RegisterStoreInput, ResetPasswordInput } from '../schemas/auth.js';

/**
 * AuthService - Business Logic Layer for Authentication
 * Handles all auth operations, database transactions, and external integrations
 */

export class AuthService {
  /**
   * Authenticate user with email and password
   */
  async login(data: LoginInput): Promise<{ user: PublicUser; token: string }> {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw Errors.unauthorized('Email o contraseña incorrectos');
    }

    const isValidPassword = await verifyPassword(data.password, user.password);
    if (!isValidPassword) {
      throw Errors.unauthorized('Email o contraseña incorrectos');
    }

    // Block login if email not verified (except ADMIN)
    if (!user.emailVerified && user.role !== UserRole.SUPER_ADMIN) {
      throw new (await import('../errors/AppError.js')).AppError({
        code: (await import('../errors/AppError.js')).ErrorCode.EMAIL_NOT_VERIFIED,
        message: 'Verificá tu email antes de iniciar sesión. Revisá tu bandeja de entrada.',
        statusCode: 403,
        details: { code: 'EMAIL_NOT_VERIFIED' },
      });
    }

    const store = await prisma.store.findUnique({ where: { ownerId: user.id } });

    const token = signUser({
      id: user.id,
      email: user.email,
      role: user.role,
      storeId: store?.id ?? null,
      name: user.name,
    });

    return { user: publicUser({ ...user, storeId: store?.id ?? null }), token };
  }

  /**
   * Register a new user (admin-only after first user)
   */
  async register(data: RegisterInput, requester?: AuthUser | null): Promise<PublicUser> {
    // Validate store role requirements
    if (data.role === UserRole.STORE_OWNER && data.storeId === undefined) {
      throw Errors.validation('storeId requerido para usuarios de tienda');
    }

    const passwordHash = await hashPassword(data.password);

    // Try to create first admin atomically
    try {
      const user = await prisma.$transaction(async (tx) => {
        const count = await tx.user.count();
        if (count > 0) {
          return null; // Not first user
        }
        return tx.user.create({
          data: {
            email: data.email,
            name: data.name,
            password: passwordHash,
            role: UserRole.SUPER_ADMIN,
            emailVerified: new Date(),
          },
        });
      });

      if (user) {
        return publicUser({ ...user, storeId: null });
      }
    } catch (err: unknown) {
      // Only ignore unique constraint violations (concurrent bootstrap race)
      const prismaError = err as { code?: string; meta?: { target?: string[] } };
      const isPrismaUniqueViolation = prismaError?.code === 'P2002' || prismaError?.meta?.target;
      if (!isPrismaUniqueViolation) throw err;
    }

    // Existing system - require admin authentication
    if (!requester || requester.role !== UserRole.SUPER_ADMIN) {
      throw Errors.forbidden('Solo administradores pueden crear usuarios');
    }

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: passwordHash,
        role: data.role as UserRole,
        emailVerified: data.role === UserRole.SUPER_ADMIN ? new Date() : null,
      },
    });

    return publicUser({ ...user, storeId: null });
  }

  /**
   * Register a new store with owner
   */
  async registerStore(data: RegisterStoreInput): Promise<RegistrationResult> {
    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw Errors.conflict('El email ya está registrado');
    }

    // Generate unique slug from store name
    const slug = await this.generateUniqueSlug(data.name);

    // Create store + user in transaction
    const passwordHash = await hashPassword(data.password);
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          name: data.ownerName,
          password: passwordHash,
          role: UserRole.STORE_OWNER,
          emailVerified: null,
        },
      });

      const store = await tx.store.create({
        data: {
          name: data.name,
          slug,
          whatsapp: data.whatsapp,
          address: data.address,
          description: data.description,
          ownerId: user.id,
        },
      });

      return { store, user };
    });

    // await this.createAndSendVerificationToken(result.user.id, result.user.email, result.user.name);

    return {
      user: publicUser(result.user),
      store: {
        id: result.store.id,
        name: result.store.name,
        slug: result.store.slug,
      },
      requiresVerification: true,
      message: 'Registro exitoso. Revisá tu email para verificar tu cuenta.',
    };
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    /*
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: { include: { store: true } } },
    });

    if (!verificationToken || verificationToken.expiresAt < new Date()) {
      throw Errors.tokenInvalid('Token inválido o expirado');
    }

    // Mark email as verified
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: new Date() },
    });

    // Clean up used token
    await prisma.emailVerificationToken.deleteMany({
      where: { userId: verificationToken.userId },
    });

    // Send welcome email
    const siteUrl = env.SITE_URL || 'http://localhost:3000';
    const storeName = verificationToken.user.store?.name || 'tu mueblería';
    await sendWelcomeEmail(
      verificationToken.user.email,
      storeName,
      `${siteUrl}/admin`
    );
    */
  }

  /**
   * Resend verification email
   */
  async resendVerification(email: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } });

    // Always succeed to prevent email enumeration
    if (!user || user.emailVerified) {
      return;
    }

    // await this.createAndSendVerificationToken(user.id, user.email, user.name);
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email } });

    // Always succeed to prevent email enumeration
    if (!user) {
      return;
    }

    // Generate new token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordReset.create({
      data: { userId: user.id, email: user.email, token, expiresAt },
    });

    // Send email
    const siteUrl = env.SITE_URL || 'http://localhost:3000';
    const resetUrl = `${siteUrl}/resetear-contrasena?token=${token}`;
    await sendPasswordResetEmail(user.email, resetUrl, user.name ?? undefined);
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordInput): Promise<void> {
    const resetToken = await prisma.passwordReset.findUnique({
      where: { token: data.token },
    });

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      throw Errors.tokenInvalid('Token inválido o expirado');
    }

    // Update password
    const passwordHash = await hashPassword(data.password);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId! },
        data: { password: passwordHash },
      }),
      prisma.passwordReset.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
    ]);
  }

  /**
   * Helper: Generate unique slug for store
   */
  private async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    let slug = baseSlug;
    let counter = 1;

    while (await prisma.store.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Helper: Create and send verification token
   */
  private async createAndSendVerificationToken(
    userId: number,
    email: string,
    name?: string | null
  ): Promise<string> {
    /*
    // Invalidate old tokens
    await prisma.emailVerificationToken.deleteMany({ where: { userId } });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.emailVerificationToken.create({
      data: { userId, token, expiresAt },
    });
    */
    const token = 'fake-token';
    const siteUrl = env.SITE_URL || 'http://localhost:3000';
    const verifyUrl = `${siteUrl}/verificar-email?token=${token}`;
    await sendVerificationEmail(email, verifyUrl, name ?? undefined);

    return token;
  }
}

// Export singleton instance
export const authService = new AuthService();
