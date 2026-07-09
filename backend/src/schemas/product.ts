import { z } from 'zod';

/**
 * Product Zod Schemas - Actualizado para nuevo schema DB
 * Centralized validation for product operations
 */

// ============================================
// SCHEMAS DE VARIANTES
// ============================================

export const ProductVariantImageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional(),
  sortOrder: z.number().default(0),
});

export const ProductVariantSchema = z.object({
  id: z.string().optional(), // Para updates
  sku: z.string().min(1, 'El SKU es requerido'),
  name: z.string().min(1, 'El nombre de la variante es requerido'),
  color: z.string().optional(),
  fabric: z.string().optional(),
  size: z.string().optional(),
  finish: z.string().optional(),
  listPrice: z.number().positive('El precio de lista debe ser positivo'),
  salePrice: z.number().positive('El precio de venta debe ser positivo'),
  currency: z.string().default('ARS'),
  stock: z.number().int().min(0).default(0),
  isDefault: z.boolean().default(false),
  images: z.array(ProductVariantImageSchema).default([]),
});

// ============================================
// SCHEMAS DE MEDIA
// ============================================

export const ProductMediaSchema = z.object({
  id: z.number().optional(),
  type: z.enum(['IMAGE', 'VIDEO', 'MODEL_3D', 'DOCUMENT']),
  url: z.string().url(),
  alt: z.string().optional(),
  sortOrder: z.number().default(0),
  isPrimary: z.boolean().default(false),
  mediaFormat: z.enum(['GLB', 'USDZ']).optional(),
  documentType: z.enum(['MANUAL', 'WARRANTY', 'ASSEMBLY_GUIDE', 'CERTIFICATE', 'OTHER']).optional(),
  title: z.string().optional(),
});

// ============================================
// SCHEMAS DE ESTRUCTURAS JSON
// ============================================

export const ProductDimensionsSchema = z.object({
  widthCm: z.number().positive(),
  heightCm: z.number().positive(),
  depthCm: z.number().positive(),
  weightKg: z.number().positive(),
  packageDimensions: z.object({
    widthCm: z.number().positive(),
    heightCm: z.number().positive(),
    depthCm: z.number().positive(),
    weightKg: z.number().positive(),
  }).optional(),
});

export const ProductMaterialsSchema = z.object({
  primary: z.string().min(1, 'El material principal es requerido'),
  structure: z.string().optional(),
  upholstery: z.object({
    fabric: z.string(),
    composition: z.string(),
    cleaningCode: z.enum(['W', 'S', 'WS', 'X']),
  }).optional(),
  legs: z.string().optional(),
  finish: z.string(),
  certifications: z.array(z.string()).default([]),
});

export const ProductWarrantySchema = z.object({
  type: z.enum(['factory', 'extended', 'none']),
  durationMonths: z.number().int().positive(),
  coverage: z.string(),
  termsUrl: z.string().url().optional(),
  conditions: z.array(z.string()).default([]),
  exclusions: z.array(z.string()).default([]),
});

export const ProductLogisticsSchema = z.object({
  deliveryTimeDays: z.object({
    min: z.number().int().positive(),
    max: z.number().int().positive(),
  }),
  deliveryType: z.enum(['home', 'branch', 'pickup', 'multiple']),
  shippingZones: z.array(z.string()).default(['CABA', 'GBA']),
  assembly: z.object({
    included: z.boolean(),
    price: z.number().optional(),
    estimatedTimeMinutes: z.number().int().optional(),
    difficulty: z.enum(['easy', 'medium', 'professional']),
    manualUrl: z.string().url().optional(),
  }),
  packaging: z.object({
    piecesCount: z.number().int().positive(),
    specialHandling: z.boolean(),
  }),
});

export const ProductSEOSchema = z.object({
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  keywords: z.array(z.string()).default([]),
});

// ============================================
// SCHEMAS DE PRECIOS E INVENTARIO
// ============================================

export const ProductPricingSchema = z.object({
  currency: z.string().default('ARS'),
  listPrice: z.number().positive().optional(),
  salePrice: z.number().positive().optional(),
  shippingCost: z.number().nullable().optional(),
  financingOptions: z.array(z.object({
    installments: z.number().int().positive(),
    installmentPrice: z.number().positive(),
    interestFree: z.boolean(),
  })).default([]),
});

export const ProductInventorySchema = z.object({
  trackStock: z.boolean().default(true),
  allowBackorder: z.boolean().default(false),
  lowStockAlert: z.number().int().default(5),
});

// ============================================
// SCHEMAS PRINCIPALES
// ============================================

export const CreateProductSchema = z.object({
  // Core
  sku: z.string().optional(), // Opcional cuando se usan variantes (cada variante tiene su SKU)
  name: z.string().min(1).max(200),
  description: z.string().optional(),

  // Categorización
  category: z.string().min(1, 'La categoría es requerida'),
  subcategory: z.string().optional(),
  room: z.string().optional(),
  style: z.string().optional(),
  tags: z.array(z.string()).default([]),

  // Estado
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),

  // Estructuras JSON
  dimensions: ProductDimensionsSchema.optional(),
  materials: ProductMaterialsSchema.optional(),
  warranty: ProductWarrantySchema.optional(),
  logistics: ProductLogisticsSchema.optional(),
  seo: ProductSEOSchema.optional(),

  // Relaciones
  variants: z.array(ProductVariantSchema).min(1, 'Debe tener al menos una variante'),
  media: z.array(ProductMediaSchema).default([]),
  pricing: ProductPricingSchema.optional(),
  inventory: ProductInventorySchema.optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial().extend({
  sku: z.string().min(1).optional(),
});

// ============================================
// SCHEMAS DE QUERY Y OTROS
// ============================================

export const productLogQuerySchema = z.object({
  action: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const bulkProductItemSchema = z.union([CreateProductSchema, UpdateProductSchema]);

// ============================================
// TYPES
// ============================================

export type ProductVariantInput = z.infer<typeof ProductVariantSchema>;
export type ProductVariantImageInput = z.infer<typeof ProductVariantImageSchema>;
export type ProductMediaInput = z.infer<typeof ProductMediaSchema>;
export type ProductDimensionsInput = z.infer<typeof ProductDimensionsSchema>;
export type ProductMaterialsInput = z.infer<typeof ProductMaterialsSchema>;
export type ProductWarrantyInput = z.infer<typeof ProductWarrantySchema>;
export type ProductLogisticsInput = z.infer<typeof ProductLogisticsSchema>;
export type ProductSEOInput = z.infer<typeof ProductSEOSchema>;
export type ProductPricingInput = z.infer<typeof ProductPricingSchema>;
export type ProductInventoryInput = z.infer<typeof ProductInventorySchema>;

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type BulkProductItem = z.infer<typeof bulkProductItemSchema>;
export type ProductLogQuery = z.infer<typeof productLogQuerySchema>;

// ============================================
// SCHEMA LEGACY (para compatibilidad temporal)
// ============================================

const productImageSchema = z.object({
  url: z.string().url(),
  type: z.string().optional(),
});

export const baseProductSchema = {
  storeId: z.number(),
  name: z.string().min(1, 'El nombre es requerido'),
  slug: z.string().min(1, 'El slug es requerido'),
  description: z.string().optional(),
  price: z.number().nonnegative('El precio debe ser positivo').optional(), // Legacy
  category: z.string().optional(),
  room: z.string().optional(),
  style: z.string().optional(),
  widthCm: z.number().optional(), // Legacy
  heightCm: z.number().optional(), // Legacy
  depthCm: z.number().optional(), // Legacy
  weightKg: z.number().optional(), // Legacy
  material: z.string().optional(), // Legacy
  color: z.string().optional(), // Legacy
  stockQty: z.number().optional(), // Legacy
  images: z.array(productImageSchema).optional(), // Legacy
  arUrl: z.string().url().optional().or(z.literal('')).or(z.literal(null)), // Legacy
  glbUrl: z.string().url().optional().or(z.literal('')).or(z.literal(null)), // Legacy
  usdzUrl: z.string().url().optional().or(z.literal('')).or(z.literal(null)), // Legacy
  imageUrl: z.string().url().optional().or(z.literal('')).or(z.literal(null)), // Legacy
  inStock: z.boolean().optional().default(true), // Legacy
  featured: z.boolean().optional().default(false), // Legacy
};

export const createProductSchemaLegacy = z.object(baseProductSchema);

export const updateProductSchemaLegacy = z.object({
  id: z.number(),
  ...baseProductSchema,
  storeId: z.number().optional(),
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
});

export type ProductImageInput = z.infer<typeof productImageSchema>;
