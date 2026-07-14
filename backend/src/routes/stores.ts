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
      ? { id: { in: matchingIds } }
      : search
        ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
            { address: { contains: search, mode: "insensitive" as const } },
            { slug: { contains: search, mode: "insensitive" as const } },
          ],
        }
        : undefined;

    const items = await prisma.store.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { products: true }
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
          orderBy: { createdAt: "desc" },
          include: { media: true },
        },
      },
    });

    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }
    return res.json({ store, products: store.products });
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
