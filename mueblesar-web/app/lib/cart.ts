export type CartItem = {
  id: number;
  slug: string;
  name: string;
  price: number;
  imageUrl: string | null;
  storeName: string;
  storeSlug: string;
  storeWhatsapp: string | null;
  quantity: number;
};

const CART_STORAGE_KEY = "amobly_cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function addToCart(item: Omit<CartItem, "quantity">): CartItem[] {
  const cart = getCart();
  const existing = cart.find((i) => i.id === item.id);
  
  let newCart: CartItem[];
  if (existing) {
    newCart = cart.map((i) =>
      i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
    );
  } else {
    newCart = [...cart, { ...item, quantity: 1 }];
  }
  
  saveCart(newCart);
  return newCart;
}

export function removeFromCart(productId: number): CartItem[] {
  const cart = getCart();
  const newCart = cart.filter((i) => i.id !== productId);
  saveCart(newCart);
  return newCart;
}

export function updateQuantity(productId: number, quantity: number): CartItem[] {
  const cart = getCart();
  if (quantity <= 0) {
    return removeFromCart(productId);
  }
  
  const newCart = cart.map((i) =>
    i.id === productId ? { ...i, quantity } : i
  );
  saveCart(newCart);
  return newCart;
}

export function clearCart(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_STORAGE_KEY);
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getCartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function generateWhatsAppMessage(items: CartItem[]): string {
  if (items.length === 0) return "";
  
  const total = getCartTotal(items);
  const itemsList = items
    .map((item) => `- ${item.name} (x${item.quantity}) $${(item.price * item.quantity).toLocaleString("es-AR")}`)
    .join("\n");
  
  return `Hola! Consulto por los siguientes productos:\n\n${itemsList}\n\n*Total: $${total.toLocaleString("es-AR")}*\n\nQuedo atento a tu respuesta. Gracias!`;
}

export function groupCartByStore(items: CartItem[]): Record<string, CartItem[]> {
  return items.reduce((acc, item) => {
    const storeKey = item.storeSlug;
    if (!acc[storeKey]) {
      acc[storeKey] = [];
    }
    acc[storeKey].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);
}
