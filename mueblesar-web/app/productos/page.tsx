export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { Container } from "../components/layout/Container";
import { fetchProducts } from "../lib/api";
import type { Product } from "@/types";
import { ProductsClient } from "./ProductsClient";
import type { ProductListItem } from "@/types";

// Datos de ejemplo para cuando el backend no está disponible
const mockProducts: any[] = [
  // ── LIVING ──────────────────────────────────────────────────
  {
    id: 1, slug: "scandi-sofa-premium", name: "Sofá Escandinavo Premium",
    price: 850000, description: "Sofá 3 cuerpos diseño nórdico, tapizado en lino anti-manchas.",
    category: "Sofás", room: "Living", style: "Nórdico",
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800",
    images: [{ id: 1, url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800" }],
    inStock: true, storeId: 1, store: { id: 1, name: "Amobly Store", slug: "amobly-store" },
  },
  {
    id: 2, slug: "eames-lounge-chair", name: "Sillón Lounge Clásico",
    price: 1299000, description: "Sillón con otomana, cuero genuino y madera de nogal.",
    category: "Sillones", room: "Living", style: "Moderno",
    imageUrl: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=800",
    images: [{ id: 2, url: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=800" }],
    inStock: true, storeId: 1, store: { id: 2, name: "Luxe Furniture", slug: "luxe-furniture" },
  },
  {
    id: 7, slug: "carrara-coffee-table", name: "Mesa de Centro Mármol",
    price: 450000, description: "Mesa de centro en mármol de Carrara, patas doradas.",
    category: "Mesas", room: "Living", style: "Lujoso",
    imageUrl: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&q=80&w=800",
    images: [{ id: 7, url: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&q=80&w=800" }],
    inStock: true, storeId: 2, store: { id: 2, name: "Luxe Furniture", slug: "luxe-furniture" },
  },
  {
    id: 4, slug: "velvet-cloud-sofa", name: "Sofá Terciopelo Verde",
    price: 950000, description: "Sofá de terciopelo verde esmeralda, 3 cuerpos.",
    category: "Sofás", room: "Living", style: "Contemporáneo",
    imageUrl: "https://images.unsplash.com/photo-1550226891-ef816aed4a98?auto=format&fit=crop&q=80&w=800",
    images: [{ id: 4, url: "https://images.unsplash.com/photo-1550226891-ef816aed4a98?auto=format&fit=crop&q=80&w=800" }],
    inStock: true, storeId: 1, store: { id: 1, name: "Amobly Store", slug: "amobly-store" },
  },
  {
    id: 6, slug: "modern-floor-lamp", name: "Lámpara de Pie Arqueada",
    price: 189000, description: "Lámpara de pie con arco regulable, base de mármol.",
    category: "Iluminación", room: "Living", style: "Moderno",
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800",
    images: [{ id: 6, url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800" }],
    inStock: true, storeId: 3, store: { id: 5, name: "Lumina", slug: "lumina" },
  },
  // ── COMEDOR ──────────────────────────────────────────────────
  {
    id: 3, slug: "nordic-oak-table", name: "Mesa Comedor Roble Nórdico",
    price: 450000, description: "Mesa de comedor en roble macizo, acabado natural, 6 personas.",
    category: "Mesas", room: "Comedor", style: "Nórdico",
    imageUrl: "https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&q=80&w=800",
    images: [{ id: 3, url: "https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&q=80&w=800" }],
    inStock: true, storeId: 2, store: { id: 3, name: "Nordic Design", slug: "nordic-design" },
  },
  {
    id: 8, slug: "scandinavian-accent-chair", name: "Silla de Comedor Escandinava",
    price: 295000, description: "Silla con patas de roble, tapizado gris, apilable.",
    category: "Sillas", room: "Comedor", style: "Escandinavo",
    imageUrl: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80&w=800",
    images: [{ id: 8, url: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80&w=800" }],
    inStock: true, storeId: 1, store: { id: 1, name: "Amobly Store", slug: "amobly-store" },
  },
  {
    id: 16, slug: "buffet-credenza-nogal", name: "Buffet Credenza Nogal",
    price: 680000, description: "Mueble aparador de comedor en nogal, 4 puertas corredizas.",
    category: "Muebles de comedor", room: "Comedor", style: "Moderno",
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800",
    images: [{ id: 16, url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800" }],
    inStock: true, storeId: 2, store: { id: 3, name: "Nordic Design", slug: "nordic-design" },
  },
  // ── DORMITORIO ───────────────────────────────────────────────
  {
    id: 5, slug: "minimalist-bed-frame", name: "Cama Matrimonial Minimalista",
    price: 320000, description: "Cama matrimonial con cabecera tapizada en lino, 160x200cm.",
    category: "Camas", room: "Dormitorio", style: "Minimalista",
    imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800",
    images: [{ id: 5, url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800" }],
    inStock: true, storeId: 2, store: { id: 4, name: "Atelier Home", slug: "atelier-home" },
  },
  {
    id: 9, slug: "oak-dresser-6-drawers", name: "Cómoda 6 Cajones Roble",
    price: 280000, description: "Cómoda de dormitorio en roble con 6 cajones de cierre suave.",
    category: "Cómodas", room: "Dormitorio", style: "Nórdico",
    imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=800",
    images: [{ id: 9, url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=800" }],
    inStock: true, storeId: 4, store: { id: 4, name: "Atelier Home", slug: "atelier-home" },
  },
  {
    id: 10, slug: "floating-nightstand", name: "Mesa de Luz Flotante",
    price: 95000, description: "Mesa de luz flotante con cajón oculto y luz LED integrada.",
    category: "Mesas de luz", room: "Dormitorio", style: "Moderno",
    imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800",
    images: [{ id: 10, url: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800" }],
    inStock: true, storeId: 4, store: { id: 4, name: "Atelier Home", slug: "atelier-home" },
  },
  // ── BAÑO ─────────────────────────────────────────────────────
  {
    id: 11, slug: "vanitory-suspendido-blanco", name: "Vanitory Suspendido Blanco",
    price: 340000, description: "Mueble bajo mesada suspendido con cubierta de cerámica blanca y espejo.",
    category: "Vanitorios", room: "Baño", style: "Moderno",
    imageUrl: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&q=80&w=800",
    images: [{ id: 11, url: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&q=80&w=800" }],
    inStock: true, storeId: 5, store: { id: 6, name: "BathSpace", slug: "bathspace" },
  },
  {
    id: 12, slug: "espejo-bano-con-estante", name: "Espejo con Estante y Luz LED",
    price: 120000, description: "Espejo de baño con estante inferior y luz LED perimetral, 80x60cm.",
    category: "Espejos", room: "Baño", style: "Minimalista",
    imageUrl: "https://images.unsplash.com/photo-1604709177225-055f99402ea3?auto=format&fit=crop&q=80&w=800",
    images: [{ id: 12, url: "https://images.unsplash.com/photo-1604709177225-055f99402ea3?auto=format&fit=crop&q=80&w=800" }],
    inStock: true, storeId: 5, store: { id: 6, name: "BathSpace", slug: "bathspace" },
  },
  {
    id: 13, slug: "mueble-columna-bano", name: "Columna de Baño con Cajones",
    price: 180000, description: "Columna de almacenamiento para baño, 4 cajones y 1 estante abierto.",
    category: "Almacenamiento", room: "Baño", style: "Escandinavo",
    imageUrl: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&q=80&w=800",
    images: [{ id: 13, url: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&q=80&w=800" }],
    inStock: true, storeId: 5, store: { id: 6, name: "BathSpace", slug: "bathspace" },
  },
  {
    id: 14, slug: "toallero-calefactor-cromo", name: "Toallero Calefactor Cromado",
    price: 95000, description: "Toallero eléctrico calefactor en acero inoxidable cromado, 60x80cm.",
    category: "Accesorios de baño", room: "Baño", style: "Moderno",
    imageUrl: "https://images.unsplash.com/photo-1620626011761-996317702782?auto=format&fit=crop&q=80&w=800",
    images: [{ id: 14, url: "https://images.unsplash.com/photo-1620626011761-996317702782?auto=format&fit=crop&q=80&w=800" }],
    inStock: true, storeId: 5, store: { id: 6, name: "BathSpace", slug: "bathspace" },
  },
  // ── COCINA ───────────────────────────────────────────────────
  {
    id: 15, slug: "isla-cocina-moderna", name: "Isla de Cocina con Desayunador",
    price: 520000, description: "Isla central para cocina con desayunador, 2 cajones y mesada de cuarzo.",
    category: "Muebles de cocina", room: "Cocina", style: "Contemporáneo",
    imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=800",
    images: [{ id: 15, url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=800" }],
    inStock: true, storeId: 3, store: { id: 3, name: "Nordic Design", slug: "nordic-design" },
  },
  {
    id: 17, slug: "alacena-madera-cocina", name: "Alacena Alta Madera Natural",
    price: 210000, description: "Alacena de cocina en madera con puertas de vidrio, 80x120cm.",
    category: "Muebles de cocina", room: "Cocina", style: "Rústico",
    imageUrl: "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?auto=format&fit=crop&q=80&w=800",
    images: [{ id: 17, url: "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?auto=format&fit=crop&q=80&w=800" }],
    inStock: true, storeId: 3, store: { id: 3, name: "Nordic Design", slug: "nordic-design" },
  },
  // ── OFICINA ──────────────────────────────────────────────────
  {
    id: 18, slug: "escritorio-home-office", name: "Escritorio Home Office Roble",
    price: 310000, description: "Escritorio para home office con organizador de cables y cajón lateral.",
    category: "Escritorios", room: "Oficina", style: "Nórdico",
    imageUrl: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&q=80&w=800",
    images: [{ id: 18, url: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&q=80&w=800" }],
    inStock: true, storeId: 4, store: { id: 4, name: "Atelier Home", slug: "atelier-home" },
  },
  {
    id: 19, slug: "silla-ergonomica-mesh", name: "Silla Ergonómica Mesh Pro",
    price: 420000, description: "Silla de oficina ergonómica con respaldo de malla, altura regulable.",
    category: "Sillas de oficina", room: "Oficina", style: "Moderno",
    imageUrl: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&q=80&w=800",
    images: [{ id: 19, url: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&q=80&w=800" }],
    inStock: true, storeId: 1, store: { id: 1, name: "Amobly Store", slug: "amobly-store" },
  },
  // ── EXTERIOR ─────────────────────────────────────────────────
  {
    id: 20, slug: "set-jardin-rattan", name: "Set de Jardín Rattan Sintético",
    price: 490000, description: "Set exterior 4 sillas + mesa de centro en rattan sintético, resistente a la lluvia.",
    category: "Muebles de exterior", room: "Exterior", style: "Moderno",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
    images: [{ id: 20, url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800" }],
    inStock: true, storeId: 3, store: { id: 3, name: "Nordic Design", slug: "nordic-design" },
  },
];

async function getProducts() {
  try {
    const data = await fetchProducts();
    return data.items.length > 0 ? data.items : mockProducts;
  } catch (error) {
    console.warn("Backend no disponible, usando datos de ejemplo");
    return mockProducts;
  }
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="bg-[#F8F9FA] min-h-screen py-8">
      <Container>
        <ProductsClient initialProducts={products as any[]} />
      </Container>
    </div>
  );
}
