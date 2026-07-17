// Tipos del Admin - Re-exportados desde @/types
// Todos los tipos admin están ahora centralizados en src/types/index.ts

export type {
  AdminProduct,
  AdminProductListItem,
  ValidationResult,
  SessionUser,
  StatsSummary,
  ProductLogEntry,
} from "@/types";

// ============================================
// TIPOS LEGACY (para compatibilidad temporal)
// ============================================

export type LegacyProduct = {
  id: number;
  storeId: number;
  name: string;
  slug: string;
  price: string | number;
  description?: string | null;
  category?: string | null;
  room?: string | null;
  style?: string | null;
  arUrl?: string | null;
  glbUrl?: string | null;
  usdzUrl?: string | null;
  imageUrl?: string | null;
  widthCm?: number | null;
  depthCm?: number | null;
  heightCm?: number | null;
  color?: string | null;
  inStock?: boolean | null;
  stockQty?: number | null;
  featured?: boolean | null;
  store?: { name?: string | null };
  images?: { url: string; type?: string }[];
};

export type Store = { id: number; name: string };

export type LoginState = {
  email: string;
  password: string;
};

export type FormState = {
  id?: number;
  storeId?: number;
  name: string;
  slug: string;
  description: string;
  category: string;
  room: string;
  style: string;
  color: string;
  featured: boolean;
  price: string;
  arUrl: string;
  glbUrl: string;
  usdzUrl: string;
  widthCm: string;
  depthCm: string;
  heightCm: string;
  imageUrl: string;
  images: { url: string; type?: string }[];
  inStock: boolean;
  stockQty: string;

  // Logística y dimensiones físicas
  weightKg: string;
  packageWidthCm: string;
  packageHeightCm: string;
  packageDepthCm: string;
  packageWeightKg: string;
  shipsPackaged: boolean;

  // Tiempos de entrega
  deliveryMinDays: string;
  deliveryMaxDays: string;
  deliveryType: string;

  // Armado
  assemblyIncluded: boolean;
  assemblyPrice: string;
  assemblyTimeMinutes: string;
  assemblyDifficulty: string;

  // Empaque
  piecesCount: string;
  specialHandling: boolean;
  freeShipping: boolean;
};

export const emptyForm: FormState = {
  id: undefined,
  storeId: undefined,
  name: "",
  slug: "",
  freeShipping: false,
  description: "",
  category: "",
  room: "",
  style: "",
  color: "",
  featured: false,
  price: "",
  arUrl: "",
  glbUrl: "",
  usdzUrl: "",
  widthCm: "",
  depthCm: "",
  heightCm: "",
  imageUrl: "",
  images: [],
  inStock: true,
  stockQty: "",

  // Valores por defecto
  weightKg: "",
  packageWidthCm: "",
  packageHeightCm: "",
  packageDepthCm: "",
  packageWeightKg: "",
  shipsPackaged: false,
  deliveryMinDays: "2",
  deliveryMaxDays: "7",
  deliveryType: "home",
  assemblyIncluded: false,
  assemblyPrice: "",
  assemblyTimeMinutes: "",
  assemblyDifficulty: "easy",
  piecesCount: "1",
  specialHandling: false,
};

export const isValidUrl = (value: string) => {
  if (!value) return false;

  // Check if it's our new JSON payload format { glb: "...url...", usdz: "...url..." }
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === "object" && parsed !== null && parsed.glb) {
      new URL(parsed.glb); // strictly validate the inner URL
      if (parsed.usdz) new URL(parsed.usdz);
      return true;
    }
  } catch {
    // Not a JSON string, fallback to standard plain string check
  }

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

export const slugify = (input: string) => {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

export type InquiryLifecycleStatus = "NEW" | "VIEWED" | "CONTACTED" | "CLOSED";

export type InquiryResult =
  | "SOLD"
  | "LOST_PRICE"
  | "LOST_STOCK"
  | "LOST_NO_REPLY"
  | "LOST_OTHER"
  | "PENDING";

export type AdminInquiry = {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  message?: string | null;
  status: InquiryLifecycleStatus;
  result?: InquiryResult | null;
  resultNote?: string | null;
  finalAmount?: number | string | null;
  createdAt: string;
  product?: {
    id: number;
    name: string;
    slug: string;
    media?: { url: string }[];
  } | null;
};

export type InquiryListResponse = {
  inquiries: AdminInquiry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type InquiryStatsResponse = {
  total: number;
  byStatus: Partial<Record<InquiryLifecycleStatus, number>>;
  byResult: Partial<Record<InquiryResult, number>>;
  today: number;
  thisWeek: number;
  sales: {
    count: number;
    totalAmount: number | string;
  };
};

export type StoreSettings = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  whatsapp?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string | null;
  socialInstagram?: string | null;
  socialFacebook?: string | null;
};

export type AdminStore = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  city?: string | null;
  province?: string | null;
  isActive?: boolean;
  isVerified?: boolean;
  _count?: { products?: number };
};

export type SubscriptionPlan = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  credits: number;
  maxProducts: number;
  features: string[];
};

export type SubscriptionStatus = {
  status: string;
  planType: string | null;
  creditsLimit: number;
  creditsUsed: number;
  creditsRemaining: number;
  nextPaymentDate: string | null;
  ai3dCredits: number;
  ai3dUsed: number;
};
