export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

import { Suspense } from "react";
import Link from "next/link";
import { ProductCard } from "./components/products/ProductCard";
import { HeroImage } from "./components/HeroImage";
import { Container } from "./components/layout/Container";
import { fetchProducts } from "./lib/api";
import { ArrowRight, Truck, Shield, Clock } from "lucide-react";
import type { Product, ProductListItem } from "@/types";
import { ProductGridSkeleton, CategoriesSkeleton, HeroSkeleton } from "./components/ui/Skeleton";

const mockProducts: any[] = [
  {
    id: 1,
    slug: "scandi-sofa-premium",
    name: "Scandi Sofa Premium 3 Cuerpos Tapizado En Lino Anti-manchas Color Gris Claro",
    price: 850000,
    description: "Diseño nórdico, máximo confort.",
    category: "Sofás",
    room: "Living",
    style: "Nórdico",
    imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800",
    images: [{ id: 1, url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800" }],
    inStock: true,
    storeId: 1,
    store: { id: 1, name: "Amobly Store", slug: "amobly-store" },
  },
  {
    id: 2,
    slug: "eames-lounge-chair",
    name: "Eames Lounge Chair Cuero Genuino Madera Nogal Reposera Clásica",
    price: 1299000,
    description: "Clásico del diseño moderno.",
    category: "Sillones",
    room: "Living",
    style: "Moderno",
    imageUrl: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=800",
    images: [{ id: 2, url: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&q=80&w=800" }],
    inStock: true,
    storeId: 1,
    store: { id: 2, name: "Luxe Furniture", slug: "luxe-furniture" },
  },
  {
    id: 3,
    slug: "nordic-oak-table",
    name: "Nordic Oak Table Mesa De Comedor 6 Puestos Roble Macizo Natural",
    price: 450000,
    description: "Mesa de comedor en roble macizo.",
    category: "Mesas",
    room: "Comedor",
    style: "Nórdico",
    imageUrl: "https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&q=80&w=800",
    images: [{ id: 3, url: "https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&q=80&w=800" }],
    inStock: true,
    storeId: 2,
    store: { id: 3, name: "Nordic Design", slug: "nordic-design" },
  },
  {
    id: 4,
    slug: "velvet-cloud-sofa",
    name: "Velvet Cloud Sofa 3 Cuerpos Terciopelo Verde Esmeralda",
    price: 950000,
    description: "Sofá de terciopelo verde esmeralda.",
    category: "Sofás",
    room: "Living",
    style: "Contemporáneo",
    imageUrl: "https://images.unsplash.com/photo-1550226891-ef816aed4a98?auto=format&fit=crop&q=80&w=800",
    images: [{ id: 4, url: "https://images.unsplash.com/photo-1550226891-ef816aed4a98?auto=format&fit=crop&q=80&w=800" }],
    inStock: true,
    storeId: 1,
    store: { id: 1, name: "Amobly Store", slug: "amobly-store" },
  },
  {
    id: 5,
    slug: "minimalist-bed-frame",
    name: "Minimalist Bed Frame Cama Matrimonial Cabecera Tapizada Lino",
    price: 320000,
    description: "Cama matrimonial con cabecera tapizada.",
    category: "Camas",
    room: "Dormitorio",
    style: "Minimalista",
    imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800",
    images: [{ id: 5, url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=800" }],
    inStock: true,
    storeId: 2,
    store: { id: 4, name: "Atelier Home", slug: "atelier-home" },
  },
  {
    id: 6,
    slug: "modern-floor-lamp",
    name: "Modern Arched Floor Lamp Lámpara De Pie Arco Regulable Mármol",
    price: 189000,
    description: "Lámpara de pie con arco regulable.",
    category: "Iluminación",
    room: "Living",
    style: "Moderno",
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800",
    images: [{ id: 6, url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800" }],
    inStock: true,
    storeId: 3,
    store: { id: 5, name: "Lumina", slug: "lumina" },
  },
  {
    id: 7,
    slug: "carrara-coffee-table",
    name: "Carrara Marble Coffee Table Mesa Centro Mármol Patas Doradas",
    price: 450000,
    description: "Mesa de centro en mármol de Carrara.",
    category: "Mesas",
    room: "Living",
    style: "Lujoso",
    imageUrl: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&q=80&w=800",
    images: [{ id: 7, url: "https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&q=80&w=800" }],
    inStock: true,
    storeId: 2,
    store: { id: 2, name: "Luxe Furniture", slug: "luxe-furniture" },
  },
  {
    id: 8,
    slug: "scandinavian-accent-chair",
    name: "Scandinavian Accent Chair Silla De Acento Patas Roble Gris",
    price: 295000,
    description: "Silla de acento con patas de roble.",
    category: "Sillas",
    room: "Comedor",
    style: "Escandinavo",
    imageUrl: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80&w=800",
    images: [{ id: 8, url: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80&w=800" }],
    inStock: true,
    storeId: 1,
    store: { id: 1, name: "Amobly Store", slug: "amobly-store" },
  },
];

const featuredRooms = [
  { label: "Living", href: "/productos?room=living", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=600" },
  { label: "Comedor", href: "/productos?room=comedor", image: "https://images.unsplash.com/photo-1617104551722-3b2d51366400?auto=format&fit=crop&q=80&w=600" },
  { label: "Dormitorio", href: "/productos?room=dormitorio", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=600" },
  { label: "Cocina", href: "/productos?room=cocina", image: "https://images.unsplash.com/photo-1556911220-bda9f7f7597e?auto=format&fit=crop&q=80&w=600" },
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

// Componente asíncrono para los productos
async function ProductsSection() {
  const products = await getProducts();

  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.slice(0, 8).map((product: any) => (
        <ProductCard key={product.id} product={product as ProductListItem} />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--gray-100)] pb-8 sm:pb-12">
      {/* Hero Section */}
      <section className="bg-white">
        <Container>
          <div className="grid items-center gap-6 py-8 lg:grid-cols-2 lg:gap-12 lg:py-12">
            {/* Text Content */}
            <div className="order-2 lg:order-1">
              <span className="inline-flex items-center rounded-full bg-[var(--primary-100)] px-3 py-1 text-xs font-bold tracking-wider text-[var(--primary-700)]">
                NUEVA COLECCIÓN 2024
              </span>

              <h1 className="mt-4 text-3xl font-extrabold leading-tight text-[var(--gray-900)] sm:text-4xl lg:text-5xl">
                Muebles para
                <span className="block text-[var(--primary-600)]">tu hogar</span>
              </h1>

              <p className="mt-4 text-base leading-relaxed text-[var(--gray-600)] lg:text-lg lg:max-w-xl">
                Descubrí piezas únicas de alta gama para transformar cada rincón de tu casa. Calidad y diseño en un solo lugar.
              </p>

              {/* CTA Buttons */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/productos"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary-600)] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--primary-600)]/25 transition-all hover:bg-[var(--primary-700)] active:scale-95"
                >
                  Explorar catálogo
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/productos?ofertas=true"
                  className="inline-flex items-center justify-center rounded-xl border border-[var(--gray-300)] bg-[var(--gray-100)] px-6 py-3 text-sm font-semibold text-[var(--gray-800)] transition-colors hover:bg-[var(--gray-200)] active:scale-95"
                >
                  Ver ofertas
                </Link>
              </div>

              {/* Stats */}
              <div className="mt-8 flex gap-8 border-t border-[var(--gray-200)] pt-6">
                <div>
                  <p className="text-2xl font-extrabold text-[var(--gray-900)] sm:text-3xl">12k+</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--gray-500)]">Clientes</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-[var(--gray-900)] sm:text-3xl">4.9/5</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--gray-500)]">Valoración</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-[var(--gray-900)] sm:text-3xl">24h</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--gray-500)]">Envío express</p>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="order-1 flex items-center justify-center lg:order-2">
              <div className="w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[480px]">
                <img
                  src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=600"
                  alt="Sofá moderno"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Benefits Bar */}
      <section className="border-b border-[var(--gray-200)] bg-white">
        <Container>
          <div className="flex overflow-x-auto py-3 gap-4 sm:gap-0 sm:py-4 sm:justify-around">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Truck className="h-4 w-4 text-[var(--success-600)] sm:h-5 sm:w-5" />
              <span className="text-xs font-medium text-[var(--gray-700)] sm:text-sm">Envío gratis</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Shield className="h-4 w-4 text-[var(--primary-600)] sm:h-5 sm:w-5" />
              <span className="text-xs font-medium text-[var(--gray-700)] sm:text-sm">Garantía 12 meses</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Clock className="h-4 w-4 text-[var(--warning-500)] sm:h-5 sm:w-5" />
              <span className="text-xs font-medium text-[var(--gray-700)] sm:text-sm">Entrega 24-48hs</span>
            </div>
          </div>
        </Container>
      </section>

      {/* Rooms Section */}
      <section className="mt-4 sm:mt-6">
        <Container>
          <div className="rounded-xl border border-[var(--gray-200)] bg-white p-3 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center justify-between sm:mb-4">
              <h2 className="text-sm font-semibold text-[var(--gray-900)] sm:text-lg">Explorá por ambientes</h2>
              <Link href="/productos" className="text-xs font-medium text-[var(--primary-600)] hover:underline sm:text-sm">
                Ver todos
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
              {featuredRooms.map((room) => (
                <Link
                  key={room.href}
                  href={room.href}
                  className="group overflow-hidden rounded-lg border border-[var(--gray-200)]"
                >
                  <div className="relative aspect-[16/10]">
                    <img
                      src={room.image}
                      alt={room.label}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute bottom-2 left-2 text-xs font-semibold text-white sm:bottom-3 sm:left-3 sm:text-sm">
                      {room.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Products Section with Suspense */}
      <section className="mt-4 sm:mt-6">
        <Container>
          <div className="rounded-xl border border-[var(--gray-200)] bg-white p-3 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center justify-between border-b border-[var(--gray-200)] pb-3 sm:mb-4 sm:pb-4">
              <h2 className="text-base font-semibold text-[var(--gray-900)] sm:text-xl">Productos destacados</h2>
              <Link
                href="/productos"
                className="text-xs font-medium text-[var(--primary-600)] hover:underline sm:text-sm"
              >
                Ver más
              </Link>
            </div>

            <Suspense fallback={<ProductGridSkeleton count={8} />}>
              <ProductsSection />
            </Suspense>
          </div>
        </Container>
      </section>
    </div>
  );
}
