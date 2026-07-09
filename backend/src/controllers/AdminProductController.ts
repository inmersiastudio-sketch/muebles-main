import type { Request, Response } from 'express';
import { productService } from '../services/ProductService.js';
import { Errors } from '../errors/AppError.js';
import {
  createProductSchema,
  updateProductSchema,
  productLogQuerySchema,
  type CreateProductInput,
  type UpdateProductInput,
} from '../schemas/product.js';
import type { AuthContext } from '../types/product.js';
import type { AuthenticatedRequest } from '../lib/auth.js';

/**
 * AdminProductController - HTTP Layer for Product Management
 */

function getAuthContext(req: Request): AuthContext {
  const authReq = req as AuthenticatedRequest;
  return {
    id: authReq.user!.id,
    role: authReq.user!.role,
    storeId: authReq.user!.storeId,
  };
}

export class AdminProductController {
  /**
   * POST /api/admin/products
   * Create a new product
   */
  async create(req: Request, res: Response): Promise<void> {
    const parsed = createProductSchema.safeParse(req.body);
    if (!parsed.success) {
      throw Errors.validation('Invalid payload', parsed.error.flatten());
    }

    const user = getAuthContext(req);
    const tolerance = Number(req.query.tolerance ?? 0.05) || 0.05;

    const product = await productService.createProduct(
      parsed.data,
      user,
      tolerance
    );

    res.status(201).json(product);
  }

  /**
   * POST /api/admin/products/bulk
   * Bulk create/update products
   */
  async bulk(req: Request, res: Response): Promise<void> {
    if (!Array.isArray(req.body)) {
      throw Errors.validation('Payload must be an array of products');
    }

    const user = getAuthContext(req);
    const items = req.body as Array<CreateProductInput | (UpdateProductInput & { id: number })>;

    const result = await productService.bulkOperation(items, user);

    res.json(result);
  }

  /**
   * PUT /api/admin/products/:id
   * Update a product
   */
  async update(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      throw Errors.validation('Invalid product ID');
    }

    const parsed = updateProductSchema.safeParse({ id, ...req.body });
    if (!parsed.success) {
      throw Errors.validation('Invalid payload', parsed.error.flatten());
    }

    const user = getAuthContext(req);
    const tolerance = Number(req.query.tolerance ?? 0.05) || 0.05;

    const { id: productId, ...data } = parsed.data;

    const product = await productService.updateProduct(
      productId,
      data,
      user,
      tolerance
    );

    res.json(product);
  }

  /**
   * DELETE /api/admin/products/:id
   * Delete a product
   */
  async delete(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      throw Errors.validation('Invalid product ID');
    }

    const user = getAuthContext(req);
    await productService.deleteProduct(id, user);

    res.status(204).send();
  }

  /**
   * GET /api/admin/products/:id/logs
   * Get product change logs
   */
  async getLogs(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      throw Errors.validation('Invalid product ID');
    }

    const user = getAuthContext(req);

    const filters = productLogQuerySchema.safeParse({
      action: req.query.action,
      from: req.query.from,
      to: req.query.to,
    });

    const logs = await productService.getProductLogs(
      id,
      user,
      filters.success ? filters.data : undefined
    );

    res.json(logs);
  }

  /**
   * GET /api/admin/products
   * List all products
   */
  async list(req: Request, res: Response): Promise<void> {
    const user = getAuthContext(req);
    const products = await productService.listProducts(user);
    res.json(products);
  }
}

// Export singleton
export const adminProductController = new AdminProductController();
