import { UserRole, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { validateGlbScale } from '../lib/scaleValidator.js';
import { Errors } from '../errors/AppError.js';
import type { AuthContext, ScaleSuggestion, ProductLogEntry, BulkOperationResult } from '../types/product.js';
import type { CreateProductInput, UpdateProductInput, ProductImageInput } from '../schemas/product.js';

/**
 * ProductService - Business Logic Layer for Products
 * Handles CRUD, image management, change logging, and scale validation
 */

interface ScaleValidationPayload {
  glbUrl?: string | null;
  arUrl?: string | null;
  widthCm?: number;
  depthCm?: number;
  heightCm?: number;
}

interface ValidationResult {
  result: { ok: boolean; sizeCm: { width: number; depth: number; height: number }; expected: Record<string, number | undefined> };
  suggestion: ScaleSuggestion | null;
}

export class ProductService {
  /**
   * Check if store user has an assigned store
   */
  ensureStoreAccess(user: AuthContext): void {
    if (user.role === UserRole.STORE_OWNER && !user.storeId) {
      throw Errors.validation('Store user without store assigned');
    }
  }

  /**
   * Validate user has access to a product
   */
  async verifyProductAccess(productId: number, user: AuthContext): Promise<void> {
    if (user.role === UserRole.STORE_OWNER && user.storeId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { storeId: true },
      });

      if (!product) {
        throw Errors.notFound('Product');
      }

      if (product.storeId !== user.storeId) {
        throw Errors.forbidden('Access denied to this product');
      }
    }
  }

  /**
   * Compute scale suggestion based on expected vs actual dimensions
   */
  private computeSuggestion(
    sizeCm: { width: number; depth: number; height: number },
    expected: { width?: number; depth?: number; height?: number }
  ): ScaleSuggestion | null {
    const priority: Array<'width' | 'depth' | 'height'> = ['width', 'depth', 'height'];
    const picked = priority.find((key) => expected[key] !== undefined);

    if (!picked) return null;

    const actual = sizeCm[picked];
    const target = expected[picked]!;

    if (!actual || actual === 0) return null;

    const factor = target / actual;
    const projectedSizeCm = {
      width: Math.round(sizeCm.width * factor * 10) / 10,
      depth: Math.round(sizeCm.depth * factor * 10) / 10,
      height: Math.round(sizeCm.height * factor * 10) / 10,
    };

    const projectedDiffs = {
      width: expected.width ? Math.abs(projectedSizeCm.width - expected.width) / expected.width : null,
      depth: expected.depth ? Math.abs(projectedSizeCm.depth - expected.depth) / expected.depth : null,
      height: expected.height ? Math.abs(projectedSizeCm.height - expected.height) / expected.height : null,
    };

    return { dimension: picked, factor, projectedSizeCm, projectedDiffs };
  }

  /**
   * Validate GLB model scale against expected dimensions
   */
  async validateScale(
    payload: ScaleValidationPayload,
    tolerance: number
  ): Promise<ValidationResult | null> {
    const targetUrl = payload.glbUrl || payload.arUrl;

    if (!targetUrl) return null;
    if (!payload.widthCm && !payload.depthCm && !payload.heightCm) return null;

    const result = await validateGlbScale({
      file: targetUrl,
      width: payload.widthCm,
      depth: payload.depthCm,
      height: payload.heightCm,
      tolerance,
    });

    const suggestion = this.computeSuggestion(result.sizeCm, result.expected);
    return { result, suggestion };
  }

  /**
   * Log a product change
   */
  async logChange(
    productId: number,
    userId: number | null,
    action: string,
    data?: Record<string, unknown>
  ): Promise<void> {
    try {
      await (prisma as unknown as { productLog: { create: (args: unknown) => Promise<unknown> } }).productLog.create({
        data: {
          productId,
          userId: userId ?? undefined,
          action,
          data: data ?? undefined,
        },
      });
    } catch (e) {
      console.error('Failed to insert product log', e);
    }
  }

  /**
   * Summarize differences between two objects
   */
  summarizeDiff(before: Record<string, unknown> | null, after: Record<string, unknown> | null): string[] {
    if (!before || !after) return [];

    const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
    const changed: string[] = [];

    for (const key of keys) {
      const b = before[key];
      const a = after[key];
      if (String(b ?? '') !== String(a ?? '')) {
        changed.push(key);
      }
    }

    return changed;
  }

  /**
   * Create a new product
   */
  async createProduct(
    data: CreateProductInput,
    user: AuthContext,
    tolerance: number = 0.05
  ): Promise<unknown> {
    this.ensureStoreAccess(user);

    // Prepare product data
    const { images, ...productData } = data;

    // Assign store for STORE role users
    if (user.role === UserRole.STORE_OWNER && user.storeId) {
      (productData as Record<string, unknown>).storeId = user.storeId;
    }

    // Validate scale if model URL provided (Warning only, do not block creation)
    const validation = await this.validateScale(productData as ScaleValidationPayload, tolerance);
    if (validation && !validation.result.ok) {
      console.warn(`Scale mismatch for product creation:`, validation.suggestion);
    }

    // Create product
    const product = await prisma.product.create({
      data: productData as Prisma.ProductCreateInput,
    });

    // Log creation
    await this.logChange(product.id, user.id, 'create', {
      summary: `Producto creado: ${product.name}`,
      payload: productData,
    });

    // Handle images
    if (images && images.length > 0) {
      await this.createProductImages(product.id, images);
    }

    return product;
  }

  /**
   * Create product images
   */
  async createProductImages(productId: number, images: ProductImageInput[]): Promise<void> {
    await prisma.productMedia.createMany({
      data: images.map((img) => ({
        productId,
        url: img.url,
        type: 'IMAGE', // assuming images are IMAGE
      })),
    });
  }

  /**
   * Update product images (replace all)
   */
  async updateProductImages(productId: number, images: ProductImageInput[]): Promise<void> {
    await prisma.$transaction([
      prisma.productMedia.deleteMany({ where: { productId, type: 'IMAGE' } }),
      prisma.productMedia.createMany({
        data: images.map((img) => ({
          productId,
          url: img.url,
          type: 'IMAGE',
        })),
      }),
    ]);
  }

  /**
   * Update an existing product
   */
  async updateProduct(
    productId: number,
    data: Partial<UpdateProductInput>,
    user: AuthContext,
    tolerance: number = 0.05
  ): Promise<unknown> {
    this.ensureStoreAccess(user);
    await this.verifyProductAccess(productId, user);

    const { images, ...productData } = data;

    // Assign store for STORE role users
    if (user.role === UserRole.STORE_OWNER && user.storeId) {
      (productData as Record<string, unknown>).storeId = user.storeId;
    }

    // Get previous state for diff
    const previous = await prisma.product.findUnique({ where: { id: productId } });
    if (!previous) {
      throw Errors.notFound('Product');
    }

    // Validate scale if model URL provided (Warning only, do not block update)
    const validation = await this.validateScale(productData as ScaleValidationPayload, tolerance);
    if (validation && !validation.result.ok) {
      console.warn(`Scale mismatch for product update ${productId}:`, validation.suggestion);
    }

    // Update product
    const product = await prisma.product.update({
      where: { id: productId },
      data: productData as Prisma.ProductUpdateInput,
    });

    // Log update
    const changedFields = this.summarizeDiff(
      previous as Record<string, unknown>,
      product as Record<string, unknown>
    );
    await this.logChange(productId, user.id, 'update', {
      summary: `Actualización de ${changedFields.length} campo(s)`,
      changedFields,
      patch: productData,
    });

    // Handle images replacement
    if (images !== undefined) {
      if (images.length > 0) {
        await this.updateProductImages(productId, images);
      } else {
        await prisma.productMedia.deleteMany({ where: { productId, type: 'IMAGE' } });
      }
    }

    return product;
  }

  /**
   * Delete a product
   */
  async deleteProduct(productId: number, user: AuthContext): Promise<void> {
    this.ensureStoreAccess(user);
    await this.verifyProductAccess(productId, user);

    const previous = await prisma.product.findUnique({ where: { id: productId } });

    // Delete related records in transaction
    await prisma.$transaction([
      prisma.productMedia.deleteMany({ where: { productId } }),
      prisma.orderItem.deleteMany({ where: { productId } }),
      prisma.product.delete({ where: { id: productId } }),
    ]);

    // Log deletion
    await this.logChange(productId, user.id, 'delete', {
      summary: 'Producto eliminado',
      previous,
    });
  }

  /**
   * Bulk create/update products
   */
  async bulkOperation(
    items: Array<CreateProductInput | (UpdateProductInput & { id: number })>,
    user: AuthContext
  ): Promise<BulkOperationResult> {
    this.ensureStoreAccess(user);

    let created = 0;
    let updated = 0;

    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        try {
          if ('id' in item && item.id) {
            // Update existing
            await this.bulkUpdateItem(tx, item as UpdateProductInput & { id: number }, user, i);
            updated++;
          } else {
            // Create new
            await this.bulkCreateItem(tx, item as CreateProductInput, user, i);
            created++;
          }
        } catch (err) {
          throw new Error(`Fila ${i + 2}: ${(err as Error).message}`);
        }
      }
    });

    return { success: true, created, updated };
  }

  /**
   * Bulk create helper
   */
  private async bulkCreateItem(
    tx: Prisma.TransactionClient,
    data: CreateProductInput,
    user: AuthContext,
    index: number
  ): Promise<void> {
    const { images, ...productData } = data;

    if (user.role === UserRole.STORE_OWNER && user.storeId) {
      (productData as Record<string, unknown>).storeId = user.storeId;
    }

    const product = await tx.product.create({
      data: productData as Prisma.ProductCreateInput,
    });

    if (images && images.length > 0) {
      await tx.productMedia.createMany({
        data: images.map((img) => ({
          productId: product.id,
          url: img.url,
          type: 'IMAGE',
        })),
      });
    }

    await (tx as unknown as { productLog: { create: (args: unknown) => Promise<unknown> } }).productLog.create({
      data: {
        productId: product.id,
        userId: user.id,
        action: 'create',
        data: { summary: 'Creado via Bulk' },
      },
    });
  }

  /**
   * Bulk update helper
   */
  private async bulkUpdateItem(
    tx: Prisma.TransactionClient,
    data: UpdateProductInput,
    user: AuthContext,
    index: number
  ): Promise<void> {
    const { id: productId, images, ...productData } = data;

    if (user.role === UserRole.STORE_OWNER && user.storeId) {
      const existing = await tx.product.findUnique({
        where: { id: productId },
        select: { storeId: true },
      });

      if (!existing || existing.storeId !== user.storeId) {
        throw new Error('Forbidden or not found');
      }

      (productData as Record<string, unknown>).storeId = user.storeId;
    }

    await tx.product.update({
      where: { id: productId },
      data: productData as Prisma.ProductUpdateInput,
    });

    if (images) {
      await tx.productMedia.deleteMany({ where: { productId, type: 'IMAGE' } });
      if (images.length > 0) {
        await tx.productMedia.createMany({
          data: images.map((img) => ({
            productId,
            url: img.url,
            type: 'IMAGE',
          })),
        });
      }
    }

    await (tx as unknown as { productLog: { create: (args: unknown) => Promise<unknown> } }).productLog.create({
      data: {
        productId,
        userId: user.id,
        action: 'update',
        data: { summary: 'Actualizado via Bulk' },
      },
    });
  }

  /**
   * Get product logs
   */
  async getProductLogs(
    productId: number,
    user: AuthContext,
    filters?: { action?: string; from?: Date; to?: Date }
  ): Promise<ProductLogEntry[]> {
    await this.verifyProductAccess(productId, user);

    const where: Record<string, unknown> = { productId };

    if (filters?.action) where.action = filters.action;
    if (filters?.from || filters?.to) {
      where.createdAt = {
        gte: filters.from,
        lte: filters.to,
      };
    }

    const logs = await (prisma as unknown as { productLog: { findMany: (args: unknown) => Promise<ProductLogEntry[]> } }).productLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    // Hydrate with user info
    const userIds = Array.from(new Set(logs.map((l) => l.userId).filter(Boolean)));
    const users = userIds.length
      ? await prisma.user.findMany({
        where: { id: { in: userIds as number[] } },
        select: { id: true, email: true, name: true },
      })
      : [];

    const byId = new Map(users.map((u) => [u.id, u]));

    return logs.map((entry) => {
      const u = entry.userId ? byId.get(entry.userId) : null;

      let parsedData = entry.data;
      if (typeof parsedData === 'string') {
        try {
          parsedData = JSON.parse(parsedData);
        } catch {
          parsedData = { raw: entry.data };
        }
      }

      return {
        ...entry,
        data: parsedData,
        userEmail: u?.email ?? null,
        userName: u?.name ?? null,
        actor: u?.name || u?.email || 'desconocido',
      };
    });
  }

  /**
   * List products for user
   */
  async listProducts(user: AuthContext): Promise<unknown[]> {
    const where = user.role === UserRole.STORE_OWNER && user.storeId
      ? { storeId: user.storeId }
      : undefined;

    const items = await prisma.product.findMany({
      where,
      include: {
        store: true,
        media: { select: { url: true, isPrimary: true, sortOrder: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((p) => ({
      ...p,
      imageUrl: p.media.find(m => m.isPrimary)?.url ?? p.media.sort((a, b) => a.sortOrder - b.sortOrder)[0]?.url ?? null,
    }));
  }
}

// Export singleton
export const productService = new ProductService();
