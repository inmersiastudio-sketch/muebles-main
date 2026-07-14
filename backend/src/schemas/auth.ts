import { z } from 'zod';
import { UserRole } from '@prisma/client';

/**
 * Authentication & Authorization Zod Schemas
 * Centralized validation schemas for auth operations
 */

// Base password schema with strong validation
export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[A-Z]/, 'Debe incluir al menos una mayúscula')
  .regex(/[a-z]/, 'Debe incluir al menos una minúscula')
  .regex(/[0-9]/, 'Debe incluir al menos un número');

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Contraseña requerida'),
});

// Registration schema (admin-only)
export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().optional(),
  password: passwordSchema,
  role: z.nativeEnum(UserRole).optional().default(UserRole.STORE_OWNER),
  storeId: z.number().optional(),
});

// Store registration schema (public)
export const registerStoreSchema = z.object({
  email: z.string().trim().email('Email inválido'),
  password: passwordSchema,
  name: z.string().trim().min(2, 'Nombre de la mueblería requerido'),
  ownerName: z.string().trim().min(2, 'Nombre del responsable requerido'),
  whatsapp: z.preprocess(
    (value) => typeof value === 'string' ? value.replace(/\D/g, '') : value,
    z.string()
      .min(10, 'WhatsApp debe incluir código de país y número')
      .max(15, 'WhatsApp debe tener como máximo 15 dígitos')
  ),
  address: z.string().trim().min(5, 'Dirección requerida'),
  description: z.string().trim().optional(),
});

// Password reset schemas
export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  password: passwordSchema,
});

// Email verification schemas
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
});

export const resendVerificationSchema = z.object({
  email: z.string().email('Email inválido'),
});

// Type exports for TypeScript inference
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RegisterStoreInput = z.infer<typeof registerStoreSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
