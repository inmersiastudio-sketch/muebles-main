import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { storeController } from "../controllers/StoreController.js";
import { requireAuth, requireRole } from "../lib/auth.js";
import { UserRole } from "@prisma/client";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

// GET /api/stores - Listar todas las tiendas (público)
router.get("/", asyncHandler(async (req, res) => {
  const search = (req.query.q as string | undefined)?.trim();
    // Full-text search: get matching store IDs first
    let matchingIds: number[] | undefined = undefined;
    if (search) {
      try {
        const tsQuery = search.split(/\s+/).filter(Boolean).join(' & ');
        const matches = await prisma.$queryRaw<{ id: number }[]>`
          SELECT id FROM "Store"
          WHERE to_tsvector('spanish', COALESCE(name, '') || ' ' || COALESCE(description, ''))
                @@ to_tsquery('spanish', ${tsQuery})
        `;
        matchingIds = matches.map(m => m.id);
      } catch (tsErr) {
        console.warn("Full-text search failed, falling back to ILIKE:", tsErr);
      }
    }

    const whereClause = matchingIds !== undefined
      ? { id: { in: matchingIds }, isActive: true }
      : search
        ? {
          isActive: true,
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
            { address: { contains: search, mode: "insensitive" as const } },
            { slug: { contains: search, mode: "insensitive" as const } },
          ],
        }
        : { isActive: true };

    const items = await prisma.store.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { products: { where: { isActive: true } } }
        }
      }
    });
    return res.json({ items, total: items.length });
  })
);

// GET /api/stores/:slug - Obtener una tienda específica (público)
router.get("/:slug", asyncHandler(async (req, res) => {
    const store = await prisma.store.findUnique({
      where: { slug: req.params.slug },
      include: {
        products: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
          include: {
            media: true,
            variants: {
              where: { isDefault: true },
              take: 1,
              include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
            },
            pricing: true,
            inventory: true,
          },
        },
      },
    });

    if (!store || !store.isActive) {
      return res.status(404).json({ error: "Store not found" });
    }

    const products = store.products.map((product) => {
      const defaultVariant = product.variants[0];
      const primaryImage = product.media.find((media) => media.type === "IMAGE" && media.isPrimary)?.url
        || product.media.find((media) => media.type === "IMAGE")?.url;
      const glbUrl = product.media.find((media) => media.type === "MODEL_3D" && media.mediaFormat === "GLB")?.url ?? null;
      const usdzUrl = product.media.find((media) => media.type === "MODEL_3D" && media.mediaFormat === "USDZ")?.url ?? null;

      return {
        id: product.id,
        slug: product.slug,
        name: product.name,
        category: product.category ?? "",
        room: product.room,
        price: Number(defaultVariant?.salePrice ?? product.pricing?.salePrice ?? 0),
        originalPrice: Number(defaultVariant?.listPrice ?? product.pricing?.listPrice ?? 0),
        currency: defaultVariant?.currency ?? product.pricing?.currency ?? "ARS",
        imageUrl: defaultVariant?.images[0]?.url ?? primaryImage,
        inStock: (product.inventory?.availableStock ?? 0) > 0,
        glbUrl,
        usdzUrl,
        hasAr: Boolean(glbUrl || usdzUrl),
      };
    });

    const { products: _products, ...publicStore } = store;
    return res.json({
      store: { ...publicStore, _count: { products: products.length } },
      products,
    });
  })
);

// Rutas protegidas - requieren autenticación
router.use(requireAuth);

// GET /api/stores/:id/settings - Obtener configuración de la tienda
router.get(
  "/:id/settings",
  requireRole([UserRole.SUPER_ADMIN, UserRole.STORE_OWNER]),
  asyncHandler(storeController.getSettings.bind(storeController))
);

// PUT /api/stores/:id/settings - Actualizar configuración de la tienda
router.put(
  "/:id/settings",
  requireRole([UserRole.SUPER_ADMIN, UserRole.STORE_OWNER]),
  asyncHandler(storeController.updateSettings.bind(storeController))
);

// POST /api/stores/:id/generate-slug - Generar slug automáticamente
router.post(
  "/:id/generate-slug",
  requireRole([UserRole.SUPER_ADMIN, UserRole.STORE_OWNER]),
  asyncHandler(storeController.generateSlug.bind(storeController))
);

export default router;
