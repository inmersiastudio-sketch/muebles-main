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
};

export const emptyForm: FormState = {
  id: undefined,
  storeId: undefined,
  name: "",
  slug: "",
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
