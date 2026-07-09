import type { Request, Response } from 'express';
import { catalogService } from '../services/CatalogService.js';
import { Errors } from '../errors/AppError.js';

/**
 * CatalogController - Controlador para endpoints públicos de catálogo
 * Sin autenticación requerida
 */

export class CatalogController {
  /**
   * GET /api/catalog/:slug
   * Obtener catálogo completo de una tienda
   */
  async getCatalog(req: Request, res: Response): Promise<void> {
    const { slug } = req.params;
    
    // Query params para paginación y filtros
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize as string) || 20));
    
    // Filtros
    const filters = {
      category: req.query.category as string | undefined,
      room: req.query.room as string | undefined,
      style: req.query.style as string | undefined,
      search: req.query.search as string | undefined,
      priceMin: req.query.priceMin ? Number(req.query.priceMin) : undefined,
      priceMax: req.query.priceMax ? Number(req.query.priceMax) : undefined,
      arOnly: req.query.arOnly === 'true',
      sort: (req.query.sort as 'price' | 'createdAt') || 'createdAt',
      direction: (req.query.direction as 'asc' | 'desc') || 'desc',
    };

    if (!slug) {
      throw Errors.validation('Store slug is required');
    }

    const catalog = await catalogService.getCatalogBySlug(
      slug,
      page,
      pageSize,
      filters
    );

    res.json({
      success: true,
      data: catalog,
    });
  }

  /**
   * GET /api/catalog/:slug/product/:productSlug
   * Obtener detalle de un producto específico
   */
  async getProductDetail(req: Request, res: Response): Promise<void> {
    const { slug, productSlug } = req.params;

    if (!slug || !productSlug) {
      throw Errors.validation('Store slug and product slug are required');
    }

    const detail = await catalogService.getProductDetail(slug, productSlug);

    res.json({
      success: true,
      data: detail,
    });
  }

  /**
   * GET /api/catalog/check-slug/:slug
   * Verificar disponibilidad de un slug (público)
   */
  async checkSlugAvailability(req: Request, res: Response): Promise<void> {
    const { slug } = req.params;

    if (!slug) {
      throw Errors.validation('Slug is required');
    }

    const isAvailable = await catalogService.isSlugAvailable(slug);

    res.json({
      success: true,
      data: {
        slug,
        available: isAvailable,
      },
    });
  }
}

// Exportar singleton
export const catalogController = new CatalogController();
