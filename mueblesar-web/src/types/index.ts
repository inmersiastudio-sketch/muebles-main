// types/index.ts - Tipos unificados para el nuevo schema

// ============================================
// MODELOS BASE (Coinciden con Prisma Schema)
// ============================================

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  attributes: {
    color?: string;
    fabric?: string;
    size?: string;
    finish?: string;
  };
  pricing: {
    listPrice: number;
    salePrice: number;
    currency: string;
  };
  inventory: {
    inStock: boolean;
    availableStock: number;
  };
  images: { url: string; alt?: string }[];
  isDefault: boolean;
}

export interface ProductPricing {
  currency: string;
  listPrice: number;
  salePrice: number;
  hasDiscount: boolean;
  discountPercentage: number;
  shippingCost: number | null;
  isFreeShipping: boolean;
  financingOptions: {
    installments: number;
    installmentPrice: number;
    interestFree: boolean;
  }[];
}

export interface ProductInventory {
  trackStock: boolean;
  inStock: boolean;
  availableStock: number;
  lowStock: boolean;
}

export interface ProductDimensions {
  widthCm: number;
  heightCm: number;
  depthCm: number;
  weightKg: number;
  volumeM3: number;
  packageDimensions?: {
    widthCm: number;
    heightCm: number;
    depthCm: number;
    weightKg: number;
  };
}

export interface ProductMaterials {
  primary: string;
  structure?: string;
  upholstery?: {
    fabric: string;
    composition: string;
    cleaningCode: 'W' | 'S' | 'WS' | 'X';
  };
  legs?: string;
  finish: string;
  certifications: string[];
}

export interface ProductWarranty {
  type: 'factory' | 'extended' | 'none';
  durationMonths: number;
  coverage: string;
  termsUrl?: string;
  conditions: string[];
  exclusions: string[];
}

export interface ProductLogistics {
  deliveryTimeDays: {
    min: number;
    max: number;
  };
  deliveryType: 'home' | 'branch' | 'pickup' | 'multiple';
  shippingZones: string[];
  assembly: {
    included: boolean;
    price?: number;
    estimatedTimeMinutes?: number;
    difficulty: 'easy' | 'medium' | 'professional';
    manualUrl?: string;
  };
  packaging: {
    piecesCount: number;
    specialHandling: boolean;
  };
}

export interface ProductMedia {
  images: {
    url: string;
    alt?: string;
    isPrimary: boolean;
  }[];
  videoUrl: string | null;
  model3d: {
    glbUrl?: string;
    usdzUrl?: string;
  } | null;
  documents: {
    type: 'MANUAL' | 'WARRANTY' | 'ASSEMBLY_GUIDE' | 'CERTIFICATE' | 'OTHER';
    url: string;
    title: string;
  }[];
}

export interface ProductReview {
  id: number;
  rating: number;
  title?: string;
  comment?: string;
  isVerifiedPurchase: boolean;
  sellerResponse?: string;
  createdAt: string;
}

export interface ProductReviews {
  averageRating: number;
  totalReviews: number;
  items: ProductReview[];
}

export interface ProductSEO {
  metaTitle: string;
  metaDescription: string;
}

// ============================================
// TIPO PRODUCT COMPLETO (PDP)
// ============================================

export interface Product {
  // Identificación
  id: number;
  sku: string;
  slug: string;
  name: string;
  description?: string;

  // Estado
  isActive: boolean;
  isFeatured: boolean;

  // Categorización
  category: string;
  subcategory?: string;
  room?: string;
  style?: string;
  tags: string[];

  // Tienda
  store: {
    id: number;
    name: string;
    slug: string;
    logoUrl?: string;
    rating?: number;
    responseTimeMinutes?: number;
    whatsapp?: string;
    address?: string;
    city?: string;
  } | null;

  // Datos estructurados
  pricing: ProductPricing;
  inventory: ProductInventory;
  dimensions: ProductDimensions;
  materials: ProductMaterials;
  warranty: ProductWarranty;
  logistics: ProductLogistics;

  // Variantes
  variants: ProductVariant[];

  // Media
  media: ProductMedia;

  // Reviews
  reviews: ProductReviews;

  // SEO
  seo: ProductSEO;

  // Relaciones
  relatedProducts: RelatedProduct[];

  // Metadata
  createdAt: string;
  updatedAt: string;
}

// ============================================
// TIPO PRODUCT LIST ITEM (PLP)
// ============================================

export interface ProductListItem {
  id: number;
  slug: string;
  name: string;
  category: string;
  room?: string;
  price: number;
  originalPrice?: number;
  currency: string;
  imageUrl?: string;
  store?: {
    name: string;
    slug: string;
  };
  inStock: boolean;
  hasDiscount?: boolean;
  discountPercentage?: number;
}

// ============================================
// PRODUCTOS RELACIONADOS
// ============================================

export interface RelatedProduct {
  id: number;
  slug: string;
  name: string;
  category: string;
  price: number;
  imageUrl?: string;
  store?: {
    name: string;
    slug: string;
  };
}

// ============================================
// TIPOS DE CATÁLOGO (LEGACY COMPATIBILITY)
// ============================================

export interface CatalogStore {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string | null;
  description?: string | null;
  whatsapp?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string;
  website?: string | null;
  socialInstagram?: string | null;
  socialFacebook?: string | null;
}

export interface CatalogProduct {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  originalPrice?: number;
  currency?: string;
  category?: string | null;
  room?: string | null;
  style?: string | null;
  imageUrl?: string | null;
  images?: { url: string; altText?: string | null; position?: number }[];
  arUrl?: string | null;
  glbUrl?: string | null;
  usdzUrl?: string | null;
  widthCm?: number | null;
  depthCm?: number | null;
  heightCm?: number | null;
  inStock?: boolean;
  featured?: boolean;
  material?: string | null;
  color?: string | null;
  hasDiscount?: boolean;
  discountPercentage?: number;
}

export interface CatalogPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface CatalogResponse {
  store: CatalogStore;
  products: CatalogProduct[];
  pagination: CatalogPagination;
}

export type CatalogProductResponse = CatalogProduct & {
  store: CatalogStore;
};

// ============================================
// API RESPONSE TYPES
// ============================================

export interface Store {
  id: number;
  name: string;
  slug: string;
  logoUrl?: string | null;
  description?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  socialInstagram?: string | null;
  _count?: {
    products: number;
  };
}

export interface ProductsResponse {
  items: ProductListItem[];
  total: number;
  page?: number;
  pageSize?: number;
  source?: string;
}

export interface StoresResponse {
  items: Store[];
  total: number;
  source?: string;
}

export type ProductResponse = Product & { source?: string };

export interface StoreDetailResponse {
  store: Store;
  products: ProductListItem[];
  source?: string;
}

// ============================================
// FILTER TYPES
// ============================================

export interface ProductFilters {
  q?: string;
  category?: string;
  room?: string;
  style?: string;
  store?: string;
  priceMin?: number;
  priceMax?: number;
  page?: number;
  pageSize?: number;
  sort?: "price" | "createdAt" | "newest" | "relevance" | "price_asc" | "price_desc";
  direction?: "asc" | "desc";
  arOnly?: boolean;
}

export interface CatalogFilters {
  category?: string;
  room?: string;
  style?: string;
  search?: string;
  priceMin?: number;
  priceMax?: number;
  arOnly?: boolean;
  sort?: "price" | "createdAt";
  direction?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface StoreFilters {
  q?: string;
}

// ============================================
// UI/COMPONENT TYPES
// ============================================

export interface CartItem {
  productId: number;
  slug: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  quantity: number;
  storeId?: number | null;
  storeName?: string | null;
}

export interface FavoriteItem {
  id: number;
  slug: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  category?: string | null;
  room?: string | null;
  style?: string | null;
  description?: string | null;
  storeName?: string | null;
  storeSlug?: string | null;
}

export type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

export interface Toast {
  id: string;
  message: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
}

// ============================================
// ADMIN TYPES
// ============================================

export interface AdminProduct {
  id: number;
  storeId: number;
  sku: string;
  slug: string;
  name: string;
  description?: string | null;
  category: string;
  subcategory?: string | null;
  room?: string | null;
  style?: string | null;
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  dimensions?: ProductDimensions;
  materials?: ProductMaterials;
  warranty?: ProductWarranty;
  logistics?: ProductLogistics;
  seo?: ProductSEO;
  variants: ProductVariant[];
  media: ProductMedia;
  pricing?: ProductPricing;
  inventory?: ProductInventory;
  store?: { name?: string | null };
}

export interface AdminProductListItem {
  id: number;
  storeId?: number;
  sku: string;
  name: string;
  slug: string;
  description?: string | null;
  category: string;
  room?: string | null;
  style?: string | null;
  isActive: boolean;
  featured?: boolean;
  inStock?: boolean;
  price?: number;
  stockQty?: number;
  // Legacy fields (for compatibility)
  arUrl?: string | null;
  glbUrl?: string | null;
  usdzUrl?: string | null;
  imageUrl?: string | null;
  widthCm?: number | null;
  depthCm?: number | null;
  heightCm?: number | null;
  color?: string | null;
  material?: string | null;
  variants: {
    id: string;
    name: string;
    salePrice: number;
    stock: number;
    isDefault: boolean;
  }[];
  inventory?: {
    availableStock: number;
  };
  media?: {
    url: string;
  }[];
  store?: {
    name?: string | null;
  };
  images?: { url: string; type?: string }[];
}

export interface ValidationResult {
  ok: boolean;
  sizeCm: { width: number; depth: number; height: number };
  expected: { width?: number; depth?: number; height?: number };
  diffs: { width: number | null; depth: number | null; height: number | null };
  suggestion?: {
    dimension: "width" | "depth" | "height";
    factor: number;
    projectedSizeCm: { width: number; depth: number; height: number };
  } | null;
}

export interface SessionUser {
  id: number;
  email: string;
  name?: string | null;
  role: "SUPER_ADMIN" | "STORE_OWNER" | "MANAGER";
  storeId?: number | null;
}

export interface StatsSummary {
  totalSales: number;
  totalOrders: number;
  avgOrder: number;
  last30Sales: number;
  topProducts: { productId: number; name: string; storeName: string; totalSold: number; units: number }[];
  arTotal: number;
  arLast30: number;
  topArProducts: { productId: number; name: string; storeName: string; views: number }[];
  lowStock: { productId: number; name: string; stockQty: number; storeName: string }[];
}

export interface ProductLogEntry {
  id: number;
  productId: number;
  userId?: number | null;
  action: string;
  data?: Record<string, unknown>;
  createdAt: string;
  actor?: string;
  userEmail?: string | null;
  userName?: string | null;
}

// ============================================
// INQUIRY TYPES (Sistema de Consultas)
// ============================================

export interface Inquiry {
  id: number;
  productId: number;
  storeId: number;
  variantId?: string | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  message?: string | null;
  channel: "whatsapp" | "email" | "phone" | "in_store";
  status: "pending" | "converted" | "lost";
  productPriceAtInquiry: number;
  finalAmount?: number | null;
  lossReason?: string | null;
  notes?: string | null;
  closedAt?: string | null;
  closedById?: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  // Relations
  product?: {
    id: number;
    name: string;
    slug: string;
    media?: {
      images: { url: string }[];
    };
  };
  variant?: {
    id: string;
    name: string;
    sku: string;
  } | null;
  store?: {
    id: number;
    name: string;
  };
  closedBy?: {
    id: number;
    name?: string;
    email: string;
  } | null;
}

export interface InquiryFilters {
  storeId?: number;
  status?: "pending" | "converted" | "lost";
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface InquiriesResponse {
  inquiries: Inquiry[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface InquiryStats {
  totalInquiries: number;
  pendingInquiries: number;
  convertedInquiries: number;
  lostInquiries: number;
  conversionRate: number;
  totalRevenue: number;
  avgResponseTimeMinutes?: number;
}

export interface CloseInquiryData {
  outcome: "converted" | "lost";
  finalAmount?: number;
  lossReason?: string;
  notes?: string;
}
