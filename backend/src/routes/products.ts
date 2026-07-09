import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

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

// ============================================
// HELPERS DE TRANSFORMACIÓN
// ============================================

/**
 * Transforma un producto crudo de Prisma en el formato limpio para el Frontend
 */
function transformProductForFrontend(product: any) {
  const defaultVariant = product.variants?.find((v: any) => v.isDefault) || product.variants?.[0];

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
    pricing: defaultVariant ? {
      currency: defaultVariant.currency,
      listPrice: defaultVariant.listPrice,
      salePrice: defaultVariant.salePrice,
      hasDiscount: defaultVariant.listPrice > defaultVariant.salePrice,
      discountPercentage: defaultVariant.listPrice > defaultVariant.salePrice
        ? Math.round((1 - defaultVariant.salePrice / defaultVariant.listPrice) * 100)
        : 0,
      shippingCost: product.pricing?.shippingCost,
      isFreeShipping: product.pricing?.shippingCost === null || product.pricing?.shippingCost === 0,
      financingOptions: product.pricing?.financingOptions || [],
    } : product.pricing,

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
    materials: product.materials || {
      primary: 'No especificado',
      finish: 'No especificado',
      certifications: [],
    },

    // Garantía
    warranty: product.warranty || {
      type: 'factory',
      durationMonths: 12,
      coverage: 'Garantía de fábrica',
      conditions: ['Defectos de fabricación'],
    },

    // Logística
    logistics: product.logistics || {
      deliveryTimeDays: { min: 3, max: 7 },
      deliveryType: 'home',
      assembly: { included: false, difficulty: 'medium' },
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
        glbUrl: product.media.find((m: any) => m.type === 'MODEL_3D' && m.mediaFormat === 'GLB')?.url,
        usdzUrl: product.media.find((m: any) => m.type === 'MODEL_3D' && m.mediaFormat === 'USDZ')?.url,
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
router.get('/', async (req: Request, res: Response) => {
  try {
    const query = ProductListQuerySchema.parse(req.query);

    const where: any = {
      isActive: true,
    };

    // Filtros
    if (query.category) where.category = query.category;
    if (query.room) where.room = query.room;
    if (query.style) where.style = query.style;

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
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { tags: { has: query.search } },
      ];
    }

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
        orderBy = { variants: { _min: { salePrice: 'asc' } } };
        break;
      case 'price_desc':
        orderBy = { variants: { _max: { salePrice: 'desc' } } };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      default:
        orderBy = { isFeatured: 'desc', createdAt: 'desc' };
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
            where: { type: 'IMAGE', isPrimary: true },
            take: 1,
            select: { url: true },
          },
          inventory: {
            select: { availableStock: true },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Transformar para frontend (versión ligera para listado)
    const transformedProducts = products.map((p: any) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      room: p.room,
      price: p.variants?.[0]?.salePrice || p.pricing?.salePrice || 0,
      originalPrice: p.variants?.[0]?.listPrice || p.pricing?.listPrice,
      currency: p.variants?.[0]?.currency || p.pricing?.currency || 'ARS',
      imageUrl: p.variants?.[0]?.images?.[0]?.url || p.media?.[0]?.url,
      store: p.store,
      inStock: (p.inventory?.availableStock || 0) > 0,
    }));

    res.json({
      items: transformedProducts,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

/**
 * GET /api/products/:slug
 * Producto individual completo para PDP
 */
router.get('/:slug', async (req: Request, res: Response) => {
  try {
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

  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
});

/**
 * GET /api/products/:slug/related
 * Productos relacionados
 */
router.get('/:slug/related', async (req: Request, res: Response) => {
  try {
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

  } catch (error) {
    console.error('Error fetching related products:', error);
    res.status(500).json({ error: 'Error al obtener productos relacionados' });
  }
});

export default router;
