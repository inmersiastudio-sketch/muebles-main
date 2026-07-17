import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

// ============================================
// SCHEMAS DE VALIDACIÓN (ZOD)
// ============================================

const ProductListQuerySchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('20').transform(Number),
  category: z.string().optional(),
  room: z.string().optional(),
  style: z.string().optional(),
  minPrice: z.string().optional().transform(Number),
  maxPrice: z.string().optional().transform(Number),
  sortBy: z.enum(['price_asc', 'price_desc', 'newest', 'relevance']).optional().default('relevance'),
  search: z.string().optional(),
  hasAr: z.string().optional().transform((v) => v === 'true'),
});

function normalizeSearchText(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

/** Busca tanto la forma con tilde como sin tilde para términos frecuentes del catálogo. */
function searchTerms(value: string): string[] {
  const normalized = normalizeSearchText(value);
  if (normalized === "sillon" || normalized === "sillones") {
    return ["sillon", "sillón", "sillones"];
  }
  return [value.trim()];
}

function productTextSearch(value: string) {
  return {
    OR: searchTerms(value).flatMap((term) => [
      { name: { contains: term, mode: "insensitive" as const } },
      { description: { contains: term, mode: "insensitive" as const } },
      { category: { contains: term, mode: "insensitive" as const } },
      { tags: { has: term } },
    ]),
  };
}

// ============================================
// HELPERS DE TRANSFORMACIÓN
// ============================================

/**
 * Transforma un producto crudo de Prisma en el formato limpio para el Frontend
 */
function transformProductForFrontend(product: any) {
  const defaultVariant = product.variants?.find((v: any) => v.isDefault) || product.variants?.[0];
  const materials = product.materials && typeof product.materials === 'object' ? product.materials : {};
  const warranty = product.warranty && typeof product.warranty === 'object' ? product.warranty : {};
  const logistics = product.logistics && typeof product.logistics === 'object' ? product.logistics : {};
  const assembly = logistics.assembly && typeof logistics.assembly === 'object' ? logistics.assembly : {};
  const packaging = logistics.packaging && typeof logistics.packaging === 'object' ? logistics.packaging : {};
  const deliveryTimeDays = logistics.deliveryTimeDays && typeof logistics.deliveryTimeDays === 'object'
    ? logistics.deliveryTimeDays
    : {};

  return {
    // Identificación
    id: product.id,
    sku: product.sku,
    slug: product.slug,
    name: product.name,
    description: product.description,

    // Estado
    isActive: product.isActive,
    isFeatured: product.isFeatured,

    // Categorización
    category: product.category,
    subcategory: product.subcategory,
    room: product.room,
    style: product.style,
    tags: product.tags,

    // Tienda
    store: product.store ? {
      id: product.store.id,
      name: product.store.name,
      slug: product.store.slug,
      logoUrl: product.store.logoUrl,
      rating: product.store.rating,
      responseTimeMinutes: product.store.responseTimeMinutes,
      whatsapp: product.store.whatsapp,
    } : null,

    // Precios (del defaultVariant o pricing general)
    pricing: {
      currency: defaultVariant?.currency || product.pricing?.currency || 'ARS',
      listPrice: defaultVariant?.listPrice || product.pricing?.listPrice || 0,
      salePrice: defaultVariant?.salePrice || product.pricing?.salePrice || 0,
      hasDiscount: defaultVariant
        ? defaultVariant.listPrice > defaultVariant.salePrice
        : (product.pricing?.listPrice || 0) > (product.pricing?.salePrice || 0),
      discountPercentage: defaultVariant
        ? (defaultVariant.listPrice > defaultVariant.salePrice ? Math.round((1 - defaultVariant.salePrice / defaultVariant.listPrice) * 100) : 0)
        : ((product.pricing?.listPrice || 0) > (product.pricing?.salePrice || 0) ? Math.round((1 - (product.pricing?.salePrice || 0) / (product.pricing?.listPrice || 1)) * 100) : 0),
      shippingCost: product.pricing?.shippingCost ?? null,
      isFreeShipping: product.pricing?.shippingCost === 0,
      financingOptions: product.pricing?.financingOptions || [],
    },

    // Inventario
    inventory: product.inventory ? {
      trackStock: product.inventory.trackStock,
      inStock: product.inventory.availableStock > 0,
      availableStock: product.inventory.availableStock,
      lowStock: product.inventory.availableStock <= product.inventory.lowStockAlert,
    } : { inStock: true, availableStock: 999 },

    // Dimensiones
    dimensions: product.dimensions || {
      widthCm: 0,
      heightCm: 0,
      depthCm: 0,
      weightKg: 0,
      volumeM3: 0,
    },

    // Materiales
    materials: {
      ...materials,
      primary: materials.primary || materials.structure || 'No especificado',
      finish: materials.finish || materials.legs || 'No especificado',
      certifications: Array.isArray(materials.certifications) ? materials.certifications : [],
    },

    // Garantía
    warranty: {
      ...warranty,
      type: warranty.type || 'factory',
      durationMonths: Number(warranty.durationMonths ?? warranty.months) || 0,
      coverage: warranty.coverage || 'A confirmar con la tienda',
      conditions: Array.isArray(warranty.conditions) ? warranty.conditions : [],
      exclusions: Array.isArray(warranty.exclusions)
        ? warranty.exclusions
        : warranty.exclusions ? [warranty.exclusions] : [],
    },

    // Logística
    logistics: {
      ...logistics,
      deliveryTimeDays: {
        min: Number(deliveryTimeDays.min) || 0,
        max: Number(deliveryTimeDays.max) || 0,
      },
      deliveryType: logistics.deliveryType || 'home',
      shippingZones: Array.isArray(logistics.shippingZones) ? logistics.shippingZones : [],
      assembly: {
        ...assembly,
        included: assembly.included ?? logistics.assemblyRequired ?? false,
        difficulty: assembly.difficulty || 'medium',
      },
      packaging: {
        ...packaging,
        piecesCount: Number(packaging.piecesCount) || 1,
        specialHandling: packaging.specialHandling ?? false,
      },
    },

    // Variantes
    variants: product.variants?.map((variant: any) => ({
      id: variant.id,
      sku: variant.sku,
      name: variant.name,
      attributes: {
        color: variant.color,
        fabric: variant.fabric,
        size: variant.size,
        finish: variant.finish,
      },
      pricing: {
        listPrice: variant.listPrice,
        salePrice: variant.salePrice,
        currency: variant.currency,
      },
      inventory: {
        inStock: variant.stock > 0,
        availableStock: variant.stock,
      },
      images: variant.images?.sort((a: any, b: any) => a.sortOrder - b.sortOrder).map((img: any) => ({
        url: img.url,
        alt: img.alt,
      })) || [],
      isDefault: variant.isDefault,
    })) || [],

    // Media principal
    media: {
      images: product.media
        ?.filter((m: any) => m.type === 'IMAGE')
        ?.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
        ?.map((m: any) => ({
          url: m.url,
          alt: m.alt,
          isPrimary: m.isPrimary,
        })) || [],
      videoUrl: product.media?.find((m: any) => m.type === 'VIDEO')?.url || null,
      model3d: product.media?.find((m: any) => m.type === 'MODEL_3D') ? {
        glbUrl: product.media.find((m: any) => m.type === 'MODEL_3D' && (m.mediaFormat === 'GLB' || m.url.toLowerCase().endsWith('.glb') || m.url.includes('.glb?')))?.url || null,
        usdzUrl: product.media.find((m: any) => m.type === 'MODEL_3D' && (m.mediaFormat === 'USDZ' || m.url.toLowerCase().endsWith('.usdz') || m.url.includes('.usdz?')))?.url || null,
      } : null,
      documents: product.media
        ?.filter((m: any) => m.type === 'DOCUMENT')
        ?.map((m: any) => ({
          type: m.documentType,
          url: m.url,
          title: m.title,
        })) || [],
    },

    // Reviews
    reviews: {
      averageRating: product.avgRating,
      totalReviews: product.reviewCount,
      items: product.reviews?.slice(0, 5).map((r: any) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        isVerifiedPurchase: r.isVerifiedPurchase,
        sellerResponse: r.sellerResponse,
        createdAt: r.createdAt,
      })) || [],
    },

    // SEO
    seo: product.seo || {
      metaTitle: product.name,
      metaDescription: product.description?.substring(0, 160) || '',
    },

    // Relaciones
    relatedProducts: product.relatedProducts?.map((rp: any) => ({
      id: rp.relatedTo.id,
      slug: rp.relatedTo.slug,
      name: rp.relatedTo.name,
      imageUrl: rp.relatedTo.media?.find((m: any) => m.isPrimary)?.url ||
        rp.relatedTo.media?.[0]?.url,
      pricing: {
        salePrice: rp.relatedTo.variants?.[0]?.salePrice || rp.relatedTo.pricing?.salePrice,
      },
    })) || [],

    // Metadata
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

// ============================================
// RUTAS
// ============================================

/**
 * GET /api/products
 * Lista de productos con filtros y paginación
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
    const query = ProductListQuerySchema.parse(req.query);

    const where: any = {
      isActive: true,
      store: { isActive: true },
    };

    const searchFilters: any[] = [];

    // Filtros
    if (query.category) {
      const normalizedCategory = normalizeSearchText(query.category);
      if (normalizedCategory === "sillon" || normalizedCategory === "sillones") {
        // La opción visual «Sillones» engloba categoría, nombre, descripción y etiquetas.
        searchFilters.push(productTextSearch("sillon"));
      } else {
        where.category = { equals: query.category, mode: 'insensitive' };
      }
    }
    if (query.room) where.room = { equals: query.room, mode: 'insensitive' };
    if (query.style) where.style = { equals: query.style, mode: 'insensitive' };

    // Filtro de precio (en variantes)
    if (query.minPrice || query.maxPrice) {
      where.variants = {
        some: {
          salePrice: {
            gte: query.minPrice || 0,
            lte: query.maxPrice || 999999999,
          },
        },
      };
    }

    // Búsqueda por texto
    if (query.search) searchFilters.push(productTextSearch(query.search));
    if (searchFilters.length > 0) where.AND = searchFilters;

    // Filtro AR (tiene modelo 3D)
    if (query.hasAr) {
      where.media = {
        some: {
          type: 'MODEL_3D',
        },
      };
    }

    // Ordenamiento
    let orderBy: any = {};
    switch (query.sortBy) {
      case 'price_asc':
        orderBy = [{ variants: { _min: { salePrice: 'asc' } } }];
        break;
      case 'price_desc':
        orderBy = [{ variants: { _max: { salePrice: 'desc' } } }];
        break;
      case 'newest':
        orderBy = [{ createdAt: 'desc' }];
        break;
      default:
        orderBy = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        take: query.limit,
        skip: (query.page - 1) * query.limit,
        orderBy,
        include: {
          store: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
              whatsapp: true,
            },
          },
          variants: {
            where: { isDefault: true },
            take: 1,
            select: {
              salePrice: true,
              listPrice: true,
              currency: true,
              images: { take: 1, select: { url: true } },
            },
          },
          media: {
            where: {
              OR: [
                { type: 'IMAGE' },
                { type: 'MODEL_3D' }
              ]
            },
            orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
            select: { type: true, url: true, mediaFormat: true, isPrimary: true },
          },
          pricing: {
            select: { salePrice: true, listPrice: true, currency: true },
          },
          inventory: {
            select: { availableStock: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Transformar para frontend (versión ligera para listado)
    const transformedProducts = products.map((p: any) => {
      const images = p.media?.filter((m: any) => m.type === 'IMAGE') || [];
      const primaryImage = images.find((m: any) => m.isPrimary)?.url || images[0]?.url;
      const hasModel3d = p.media?.some((m: any) => m.type === 'MODEL_3D');
      const glbUrl = p.media?.find((m: any) => m.type === 'MODEL_3D' && m.mediaFormat === 'GLB')?.url;
      const usdzUrl = p.media?.find((m: any) => m.type === 'MODEL_3D' && m.mediaFormat === 'USDZ')?.url;

      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        category: p.category,
        room: p.room,
        price: p.variants?.[0]?.salePrice || p.pricing?.salePrice || 0,
        originalPrice: p.variants?.[0]?.listPrice || p.pricing?.listPrice,
        currency: p.variants?.[0]?.currency || p.pricing?.currency || 'ARS',
        imageUrl: p.variants?.[0]?.images?.[0]?.url || primaryImage || null,
        store: p.store,
        inStock: (p.inventory?.availableStock || 0) > 0,
        hasAr: hasModel3d,
        glbUrl: glbUrl || null,
        usdzUrl: usdzUrl || null,
      };
    });

    res.json({
      items: transformedProducts,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });

  })
);

/**
 * GET /api/products/:slug
 * Producto individual completo para PDP
 */
router.get('/:slug', asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            rating: true,
            responseTimeMinutes: true,
            whatsapp: true,
            address: true,
            city: true,
          },
        },
        variants: {
          include: {
            images: {
              orderBy: { sortOrder: 'asc' },
            },
          },
          orderBy: [
            { isDefault: 'desc' },
            { createdAt: 'asc' },
          ],
        },
        pricing: true,
        inventory: true,
        media: {
          orderBy: { sortOrder: 'asc' },
        },
        reviews: {
          where: { isVisible: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        relatedProducts: {
          where: { type: 'RELATED' },
          include: {
            relatedTo: {
              include: {
                media: { where: { isPrimary: true }, take: 1 },
                variants: { where: { isDefault: true }, take: 1 },
                pricing: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Incrementar contador de vistas (async, no esperamos)
    prisma.product.update({
      where: { id: product.id },
      data: { viewCount: { increment: 1 } },
    }).catch(console.error);

    const transformedProduct = transformProductForFrontend(product);

    res.json(transformedProduct);

  })
);

/**
 * GET /api/products/:slug/related
 * Productos relacionados
 */
router.get('/:slug/related', asyncHandler(async (req: Request, res: Response) => {
    const { slug } = req.params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        relatedProducts: {
          where: { type: 'RELATED' },
          take: 4,
          include: {
            relatedTo: {
              include: {
                store: { select: { name: true, slug: true } },
                media: { where: { isPrimary: true }, take: 1 },
                variants: { where: { isDefault: true }, take: 1 },
                pricing: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const related = product.relatedProducts.map((rp: any) => ({
      id: rp.relatedTo.id,
      slug: rp.relatedTo.slug,
      name: rp.relatedTo.name,
      category: rp.relatedTo.category,
      price: rp.relatedTo.variants?.[0]?.salePrice || rp.relatedTo.pricing?.salePrice,
      imageUrl: rp.relatedTo.media?.[0]?.url,
      store: rp.relatedTo.store,
    }));

    res.json(related);

  })
);

export default router;
