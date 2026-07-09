import type { UserRole } from '@prisma/client';

/**
 * Product Type Definitions
 */

export interface AuthContext {
  id: number;
  role: UserRole;
  storeId?: number | null;
}

export interface ScaleValidationResult {
  ok: boolean;
  sizeCm: {
    width: number;
    depth: number;
    height: number;
  };
  expected: {
    width?: number;
    depth?: number;
    height?: number;
  };
}

export interface ScaleSuggestion {
  dimension: 'width' | 'depth' | 'height';
  factor: number;
  projectedSizeCm: {
    width: number;
    depth: number;
    height: number;
  };
  projectedDiffs: {
    width: number | null;
    depth: number | null;
    height: number | null;
  };
}

export interface ProductImageInput {
  url: string;
  type?: string;
}

export interface ProductLogEntry {
  id: number;
  productId: number;
  userId: number | null;
  action: string;
  data: unknown;
  createdAt: Date;
  userEmail?: string | null;
  userName?: string | null;
  actor?: string;
}

export interface BulkOperationResult {
  success: boolean;
  created: number;
  updated: number;
}
