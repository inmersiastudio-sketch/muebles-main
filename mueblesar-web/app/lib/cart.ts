export type InquiryProduct = {
  id: number;
  slug: string;
  name: string;
  price: number;
  imageUrl: string | null;
  storeName: string;
  storeSlug: string;
  storeWhatsapp: string | null;
  quantity?: number;
};

export type StoreInquiryGroup = {
  id: string;
  storeName: string;
  storeSlug: string;
  storeWhatsapp: string | null;
  items: InquiryProduct[];
};

const LEGACY_SAVED_PRODUCTS_STORAGE_KEY = "amobly_cart";

function getStoreGroupId(product: InquiryProduct): string {
  return product.storeSlug || product.storeName || String(product.id);
}

function getProductInquiryPath(product: InquiryProduct): string {
  return product.storeSlug
    ? `/catalog/${product.storeSlug}/${product.slug}`
    : `/productos/${product.slug}`;
}

export function getLegacySavedProducts(): InquiryProduct[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(LEGACY_SAVED_PRODUCTS_STORAGE_KEY);
    const products: unknown = stored ? JSON.parse(stored) : [];

    if (!Array.isArray(products)) return [];

    return products.filter(
      (product): product is InquiryProduct =>
        typeof product === "object" &&
        product !== null &&
        typeof product.id === "number" &&
        typeof product.slug === "string" &&
        typeof product.name === "string"
    );
  } catch {
    return [];
  }
}

export function clearLegacySavedProducts(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LEGACY_SAVED_PRODUCTS_STORAGE_KEY);
}

export function removeLegacyStoreGroup(storeId: string): void {
  const remaining = getLegacySavedProducts().filter(
    (product) => getStoreGroupId(product) !== storeId
  );

  if (typeof window === "undefined") return;

  if (remaining.length === 0) {
    localStorage.removeItem(LEGACY_SAVED_PRODUCTS_STORAGE_KEY);
    return;
  }

  localStorage.setItem(LEGACY_SAVED_PRODUCTS_STORAGE_KEY, JSON.stringify(remaining));
}

export function groupProductsByStore(items: InquiryProduct[]): StoreInquiryGroup[] {
  const groups = new Map<string, StoreInquiryGroup>();

  for (const item of items) {
    const id = getStoreGroupId(item);
    const existing = groups.get(id);

    if (existing) {
      existing.items.push(item);
      continue;
    }

    groups.set(id, {
      id,
      storeName: item.storeName || "Muebleria",
      storeSlug: item.storeSlug,
      storeWhatsapp: item.storeWhatsapp,
      items: [item],
    });
  }

  return [...groups.values()];
}

export function createInquiryMessage(items: InquiryProduct[]): string {
  const products = items
    .map((item) => {
      const quantity = item.quantity && item.quantity > 1 ? ` (x${item.quantity})` : "";
      return `- ${item.name}${quantity}`;
    })
    .join("\n");

  return [
    "Hola, quisiera consultar por los siguientes productos:",
    "",
    products,
    "",
    "Podrian indicarme disponibilidad y opciones? Gracias.",
  ].join("\n");
}

export function createWhatsAppInquiryUrl(
  storeWhatsapp: string | null | undefined,
  items: InquiryProduct[]
): string | null {
  const phone = storeWhatsapp?.replace(/\D/g, "");
  if (!phone || items.length === 0) return null;

  return `https://wa.me/${phone}?text=${encodeURIComponent(createInquiryMessage(items))}`;
}

export function getInquiryDestination(product: InquiryProduct): {
  href: string;
  isWhatsApp: boolean;
} {
  const whatsAppUrl = createWhatsAppInquiryUrl(product.storeWhatsapp, [product]);

  return whatsAppUrl
    ? { href: whatsAppUrl, isWhatsApp: true }
    : { href: getProductInquiryPath(product), isWhatsApp: false };
}
