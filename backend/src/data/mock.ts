export type Store = {
  id: number;
  name: string;
  slug: string;
  logoUrl: string;
  description: string;
  whatsapp: string;
  address: string;
};

export type Product = {
  id: number;
  storeId: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  room: string;
  style: string;
  widthCm?: number;
  heightCm?: number;
  depthCm?: number;
  material?: string;
  color?: string;
  inStock: boolean;
  featured: boolean;
  imageUrl: string;
  // Consolidated AR URLs - use glbUrl (Android/Web) and usdzUrl (iOS)
  glbUrl?: string;
  usdzUrl?: string;
  // @deprecated - kept for backward compatibility during migration
  arUrl?: string;
};

export const stores: Store[] = [
  {
    id: 1,
    name: "Muebles Del Sol",
    slug: "muebles-del-sol",
    logoUrl: "https://placehold.co/120x60?text=Del+Sol",
    description: "Mueblería especializada en living y comedor.",
    whatsapp: "5493511111111",
    address: "Av. Siempre Viva 123, Córdoba",
  },
  {
    id: 2,
    name: "Casa Linda",
    slug: "casa-linda",
    logoUrl: "https://placehold.co/120x60?text=Casa+Linda",
    description: "Diseño escandinavo y minimalista.",
    whatsapp: "5493512222222",
    address: "Bv. Principal 456, Córdoba",
  },
];

export const products: Product[] = [
  {
    id: 101,
    storeId: 1,
    name: "Sofá Moderno Gris 3 Cuerpos",
    slug: "sofa-moderno-gris-3-cuerpos",
    description: "Sofá tapizado en tela gris con patas de madera maciza.",
    price: 75000,
    category: "sofas",
    room: "living",
    style: "moderno",
    widthCm: 210,
    heightCm: 85,
    depthCm: 95,
    material: "Tela y madera",
    color: "gris",
    inStock: true,
    featured: true,
    imageUrl: "https://placehold.co/800x600?text=Sofa+Gris",
    glbUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
  },
  {
    id: 102,
    storeId: 2,
    name: "Mesa Comedor Roble 6 Personas",
    slug: "mesa-comedor-roble-6-personas",
    description: "Mesa de roble macizo con acabado natural.",
    price: 92000,
    category: "mesas",
    room: "comedor",
    style: "escandinavo",
    widthCm: 180,
    heightCm: 75,
    depthCm: 90,
    material: "Roble macizo",
    color: "madera",
    inStock: true,
    featured: false,
    imageUrl: "https://placehold.co/800x600?text=Mesa+Roble",
  },
];
