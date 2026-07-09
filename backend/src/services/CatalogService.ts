import { prisma } from '../lib/prisma.js';
import { Errors } from '../errors/AppError.js';

/**
 * CatalogService - Servicio para catálogos públicos de tiendas
 * Endpoints públicos sin autenticación
 */

export interface CatalogProduct {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  originalPrice: number;
  hasDiscount: boolean;
  discountPercentage: number;
  currency: string;
  category: string | null;
  room: string | null;
  style: string | null;
  widthCm: number | null;
  heightCm: number | null;
  depthCm: number | null;
  weightKg: number | null;
  material: string | null;
  color: string | null;
  inStock: boolean;
  stockQty: number;
  featured: boolean;
  imageUrl: string | null;
  glbUrl: string | null;
  usdzUrl: string | null;
  images: { url: string; altText: string | null; position: number }[];
}

export interface CatalogStore {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  country: string;
  socialInstagram: string | null;
  socialFacebook: string | null;
}

export interface CatalogResponse {
  store: CatalogStore;
  products: CatalogProduct[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductDetailResponse {
  store: CatalogStore;
  product: CatalogProduct;
  relatedProducts: CatalogProduct[];
}

export class CatalogService {
  /**
   * Validar formato de slug
   */
  private validateSlug(slug: string): boolean {
    // Solo letras minúsculas, números y guiones
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    return slugRegex.test(slug);
  }

  /**
   * Generar slug a partir del nombre de la tienda
   */
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/[^a-z0-9\s]/g, '') // Eliminar caracteres especiales
      .trim()
      .replace(/\s+/g, '-'); // Reemplazar espacios con guiones
  }

  /**
   * Obtener catálogo público de una tienda por slug
   */
  async getCatalogBySlug(
    storeSlug: string,
    page: number = 1,
    pageSize: number = 20,
    filters: {
      category?: string;
      room?: string;
      style?: string;
      search?: string;
      priceMin?: number;
      priceMax?: number;
      arOnly?: boolean;
      sort?: 'price' | 'createdAt';
      direction?: 'asc' | 'desc';
    } = {}
  ): Promise<CatalogResponse> {
    // Validar slug
    if (!this.validateSlug(storeSlug)) {
      throw Errors.validation('Invalid store slug format');
    }

    // Buscar tienda
    const store = await prisma.store.findUnique({
      where: { slug: storeSlug },
    }) as any;

    if (!store) {
      throw Errors.notFound('Store');
    }

    if (!store.isActive) {
      throw Errors.forbidden('Store is not active');
    }

    const where: any = {
      storeId: store.id,
      isActive: true,
    };

    if (filters.category) {
      where.category = { equals: filters.category, mode: 'insensitive' };
    }

    if (filters.room) {
      where.room = { equals: filters.room, mode: 'insensitive' };
    }

    if (filters.style) {
      where.style = { equals: filters.style, mode: 'insensitive' };
    }

    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      where.variants = {
        some: {
          salePrice: {
            gte: filters.priceMin || 0,
            lte: filters.priceMax || 9999999,
          }
        }
      };
    }

    if (filters.arOnly) {
      where.media = {
        some: { type: 'MODEL_3D' }
      };
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { category: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Contar total
    const total = await prisma.product.count({ where });

    // Construir orderBy
    const orderBy: any = [];
    if (filters.sort === 'price') {
      orderBy.push({ variants: { _min: { salePrice: filters.direction || 'asc' } } });
    } else {
      orderBy.push({ isFeatured: 'desc' });
      orderBy.push({ createdAt: filters.direction || 'desc' });
    }

    // Obtener productos paginados
    const products = await prisma.product.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy,
      include: {
        media: {
          where: { type: 'IMAGE' },
          orderBy: { sortOrder: 'asc' },
        },
        variants: {
          where: { isDefault: true },
          take: 1,
        },
        pricing: true,
        inventory: true,
      },
    }) as any[];

    const totalPages = Math.ceil(total / pageSize);

    return {
      store: this.mapStoreToCatalog(store),
      products: products.map((p) => this.mapProductToCatalog(p)),
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    };
  }

  /**
   * Obtener detalle de un producto específico del catálogo
   */
  async getProductDetail(
    storeSlug: string,
    productSlug: string
  ): Promise<ProductDetailResponse> {
    if (!this.validateSlug(storeSlug) || !this.validateSlug(productSlug)) {
      throw Errors.validation('Invalid slug format');
    }

    const store = await prisma.store.findUnique({
      where: { slug: storeSlug },
    }) as any;

    if (!store) {
      throw Errors.notFound('Store');
    }

    if (!store.isActive) {
      throw Errors.forbidden('Store is not active');
    }

    const product = await prisma.product.findFirst({
      where: {
        storeId: store.id,
        slug: productSlug,
        isActive: true,
      },
      include: {
        media: {
          orderBy: { sortOrder: 'asc' },
        },
        variants: {
          where: { isDefault: true },
          take: 1,
        },
        pricing: true,
        inventory: true,
      },
    }) as any;

    if (!product) {
      throw Errors.notFound('Product');
    }

    // Obtener productos relacionados (misma categoría)
    const relatedProducts = await prisma.product.findMany({
      where: {
        storeId: store.id,
        category: product.category,
        id: { not: product.id },
        inventory: { availableStock: { gt: 0 } },
      },
      take: 4,
      orderBy: { isFeatured: 'desc' },
      include: {
        media: {
          where: { type: 'IMAGE', isPrimary: true },
          take: 1,
        },
        variants: {
          where: { isDefault: true },
          take: 1,
        },
        pricing: true,
      },
    }) as any[];

    return {
      store: this.mapStoreToCatalog(store),
      product: this.mapProductToCatalog(product),
      relatedProducts: relatedProducts.map((p) => this.mapProductToCatalog(p)),
    };
  }

  /**
   * Verificar si un slug está disponible
   */
  async isSlugAvailable(slug: string, excludeStoreId?: number): Promise<boolean> {
    if (!this.validateSlug(slug)) {
      return false;
    }

    const where: any = { slug };
    if (excludeStoreId) {
      where.id = { not: excludeStoreId };
    }

    const existing = await prisma.store.findFirst({ where });
    return !existing;
  }

  /**
   * Mapear Store a formato de catálogo
   */
  private mapStoreToCatalog(store: any): CatalogStore {
    return {
      id: store.id,
      name: store.name,
      slug: store.slug,
      logoUrl: store.logoUrl,
      description: store.description,
      whatsapp: store.whatsapp,
      phone: store.phone,
      email: store.email,
      website: store.website,
      address: store.address,
      city: store.city,
      province: store.province,
      country: store.country || 'Argentina',
      socialInstagram: store.socialInstagram,
      socialFacebook: store.socialFacebook,
    };
  }

  /**
   * Mapear Product a formato de catálogo
   */
  private mapProductToCatalog(product: any): CatalogProduct {
    const mainImage = product.media?.find((m: any) => m.isPrimary)?.url || product.media?.[0]?.url || null;
    const defaultVariant = product.variants?.[0];
    
    // Calcular precios
    const listPrice = defaultVariant?.listPrice || product.pricing?.listPrice || 0;
    const salePrice = defaultVariant?.salePrice || product.pricing?.salePrice || 0;
    const hasDiscount = listPrice > salePrice && listPrice > 0;
    const discountPercentage = hasDiscount 
      ? Math.round((1 - salePrice / listPrice) * 100)
      : 0;

    // Parse dimensions (it's JSON)
    const dimensions = product.dimensions || {};
    const materials = product.materials || {};

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: Number(salePrice),
      originalPrice: Number(listPrice),
      hasDiscount,
      discountPercentage,
      currency: defaultVariant?.currency || product.pricing?.currency || 'ARS',
      category: product.category,
      room: product.room,
      style: product.style,
      widthCm: dimensions?.widthCm ? Number(dimensions.widthCm) : null,
      heightCm: dimensions?.heightCm ? Number(dimensions.heightCm) : null,
      depthCm: dimensions?.depthCm ? Number(dimensions.depthCm) : null,
      weightKg: dimensions?.weightKg ? Number(dimensions.weightKg) : null,
      material: materials?.primary || null,
      color: defaultVariant?.color || null,
      inStock: (product.inventory?.availableStock || 0) > 0,
      stockQty: product.inventory?.availableStock || 0,
      featured: product.isFeatured || false,
      imageUrl: mainImage,
      glbUrl: product.media?.find((m: any) => m.type === 'MODEL_3D' && m.mediaFormat === 'GLB')?.url || null,
      usdzUrl: product.media?.find((m: any) => m.type === 'MODEL_3D' && m.mediaFormat === 'USDZ')?.url || null,
      images: product.media?.filter((m: any) => m.type === 'IMAGE').map((m: any, idx: number) => ({
        url: m.url,
        altText: m.alt,
        position: m.sortOrder || idx
      })) || [],
    };
  }
}

// Exportar singleton
export const catalogService = new CatalogService();
