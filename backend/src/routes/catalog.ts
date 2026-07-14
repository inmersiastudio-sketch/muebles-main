import { Router } from "express";
import { catalogService } from "../services/CatalogService.js";
import { Errors } from "../errors/AppError.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

// GET /api/catalog/:slug - Get catalog by store slug (public)
router.get("/:slug", asyncHandler(async (req, res) => {
    const { slug } = req.params;

    // Query params para paginación y filtros
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize as string) || 12));

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

    const catalog = await catalogService.getCatalogBySlug(slug, page, pageSize, filters);

    res.json({
      data: catalog,
    });
  })
);

// GET /api/catalog/:storeSlug/:productSlug - Get specific product from catalog (public)
router.get("/:storeSlug/:productSlug", asyncHandler(async (req, res) => {
    const { storeSlug, productSlug } = req.params;

    const detail = await catalogService.getProductDetail(storeSlug, productSlug);

    res.json(detail);
  })
);

export default router;
