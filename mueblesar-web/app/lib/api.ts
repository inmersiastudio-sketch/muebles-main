import type {
  Product,
  ProductsResponse,
  Store,
  StoresResponse,
  StoreDetailResponse,
  ProductResponse,
  ProductFilters,
  StoreFilters,
  CatalogStore,
  CatalogProduct,
  CatalogResponse,
} from "@/types";

// API base URL - MUST be configured in production
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL environment variable is required");
}

// ============ Re-exports de tipos de catálogo ============
// Los tipos CatalogStore, CatalogProduct, etc. se importan desde @/types

export type { CatalogStore, CatalogProduct, CatalogResponse };

const buildQuery = (filters: ProductFilters): string => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === "" || value === null) return;

    const apiKeyMap: Record<string, string> = {
      q: "search",
      pageSize: "limit",
      priceMin: "minPrice",
      priceMax: "maxPrice",
      arOnly: "hasAr",
      sort: "sortBy",
    };
    const apiKey = apiKeyMap[key] || key;
    let apiValue = value;

    if (key === "sort") {
      const sortMap: Record<string, string> = {
        price_asc: "price_asc",
        price_desc: "price_desc",
        newest: "newest",
        relevance: "relevance",
        price: filters.direction === "desc" ? "price_desc" : "price_asc",
        createdAt: "newest",
      };
      apiValue = sortMap[String(value)] || value;
    }

    if (typeof value === "boolean") {
      if (value) params.set(apiKey, "true");
      return;
    }
    params.set(apiKey, String(apiValue));
  });

  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

export async function fetchProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/products${buildQuery(filters)}`, { next: { revalidate: 60 } });
    if (!res.ok) {
      throw new Error(`Bad status ${res.status}`);
    }
    const data = await res.json();
    return {
      ...data,
      total: data.total ?? data.pagination?.total ?? data.items?.length ?? 0,
      page: data.page ?? data.pagination?.page,
      pageSize: data.pageSize ?? data.pagination?.limit,
    };
  } catch (error) {
    console.error("Failed to fetch products", error);
    return { items: [], total: 0 };
  }
}

export async function fetchStores(filters: StoreFilters = {}): Promise<StoresResponse> {
  try {
    const qs = filters.q ? `?q=${encodeURIComponent(filters.q)}` : "";
    const res = await fetch(
      `${API_BASE}/api/stores${qs}`,
      filters.q ? { cache: "no-store" } : { next: { revalidate: 60 } }
    );
    if (!res.ok) throw new Error(`Bad status ${res.status}`);
    return res.json();
  } catch (error) {
    console.error("Failed to fetch stores", error);
    return { items: [], total: 0 };
  }
}

export async function fetchStoreBySlug(slug: string): Promise<StoreDetailResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/api/stores/${slug}`, { next: { revalidate: 60 } });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Bad status ${res.status}`);
    return res.json();
  } catch (error) {
    console.error(`Failed to fetch store ${slug}`, error);
    return null;
  }
}

export async function fetchProductBySlug(slug: string) {
  const res = await fetch(`${API_BASE}/api/products/${slug}`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) return null;

  return res.json(); // Ya viene transformado del backend
}

// ============ Public Catalog API ============

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

export async function fetchCatalogBySlug(
  slug: string,
  filters: CatalogFilters = {}
): Promise<{ data: CatalogResponse } | null> {
  try {
    // Build query string
    const params = new URLSearchParams();
    if (filters.category) params.append("category", filters.category);
    if (filters.room) params.append("room", filters.room);
    if (filters.style) params.append("style", filters.style);
    if (filters.search) params.append("search", filters.search);
    if (filters.priceMin !== undefined) params.append("priceMin", String(filters.priceMin));
    if (filters.priceMax !== undefined) params.append("priceMax", String(filters.priceMax));
    if (filters.arOnly) params.append("arOnly", "true");
    if (filters.sort) params.append("sort", filters.sort);
    if (filters.direction) params.append("direction", filters.direction);
    if (filters.page) params.append("page", String(filters.page));
    if (filters.pageSize) params.append("pageSize", String(filters.pageSize));

    const queryString = params.toString();
    const url = `${API_BASE}/api/catalog/${slug}${queryString ? `?${queryString}` : ""}`;

    const res = await fetch(url, {
      next: { revalidate: 60 } // Cache for 1 minute
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Bad status ${res.status}`);
    return res.json();
  } catch (error) {
    console.error(`Failed to fetch catalog ${slug}`, error);
    return null;
  }
}

export type CatalogProductDetailResponse = {
  store: CatalogStore;
  product: CatalogProduct;
  relatedProducts: CatalogProduct[];
};

export async function fetchCatalogProduct(storeSlug: string, productSlug: string): Promise<CatalogProductDetailResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/api/catalog/${storeSlug}/${productSlug}`, {
      next: { revalidate: 60 }
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Bad status ${res.status}`);
    return res.json();
  } catch (error) {
    console.error(`Failed to fetch catalog product ${storeSlug}/${productSlug}`, error);
    return null;
  }
}


