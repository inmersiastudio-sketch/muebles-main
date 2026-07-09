import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { stores, products } from "../data/mock.js";
import { storeController } from "../controllers/StoreController.js";
import { requireAuth, requireRole } from "../lib/auth.js";
import { UserRole } from "@prisma/client";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

// GET /api/stores - Listar todas las tiendas (público)
router.get("/", async (req, res) => {
  const search = (req.query.q as string | undefined)?.trim();
  try {
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
  } catch (err) {
    const filtered = search
      ? stores.filter((s) => {
        const haystack = `${s.name} ${s.slug} ${s.description ?? ""} ${s.address ?? ""}`.toLowerCase();
        return haystack.includes(search.toLowerCase());
      })
      : stores;
    return res.json({ items: filtered, total: filtered.length, source: "mock", error: (err as Error).message });
  }
});

// GET /api/stores/:slug - Obtener una tienda específica (público)
router.get("/:slug", async (req, res) => {
  try {
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
  } catch (err) {
    const store = stores.find((s) => s.slug === req.params.slug);
    if (!store) {
      return res.status(404).json({ error: "Store not found" });
    }
    const storeProducts = products.filter((p) => p.storeId === store.id);
    return res.json({ store, products: storeProducts, source: "mock", error: (err as Error).message });
  }
});

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
