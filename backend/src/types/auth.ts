import type { UserRole } from '@prisma/client';

/**
 * Authentication Type Definitions
 * Shared types for auth across the application
 */

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
  storeId?: number | null;
  name?: string | null;
}

export interface PublicUser {
  id: number;
  email: string;
  name: string | null;
  role: UserRole;
  storeId: number | null;
}

export interface TokenPayload {
  sub: number;
  email: string;
  role: UserRole;
  storeId?: number | null;
  name?: string | null;
}

export interface StoreRegistrationData {
  email: string;
  password: string;
  name: string;
  ownerName: string;
  whatsapp: string;
  address: string;
  description?: string;
}

export interface RegistrationResult {
  user: PublicUser;
  store: {
    id: number;
    name: string;
    slug: string;
  };
  requiresVerification: boolean;
  message: string;
}
