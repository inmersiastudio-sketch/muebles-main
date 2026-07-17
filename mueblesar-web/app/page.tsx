export const revalidate = 60;

import { Suspense } from "react";
import Link from "next/link";
import { ProductCard } from "./components/products/ProductCard";
import { Container } from "./components/layout/Container";
import { fetchProducts } from "./lib/api";
import { ArrowRight, Cuboid, MapPin, MessageCircle } from "lucide-react";
import type { ProductListItem } from "@/types";
import { ProductGridSkeleton } from "./components/ui/Skeleton";

const featuredRooms = [
  { label: "Living", href: "/productos?room=living", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=600" },
  { label: "Comedor", href: "/productos?room=comedor", image: "https://images.unsplash.com/photo-1617104551722-3b2d51366400?auto=format&fit=crop&q=80&w=600" },
  { label: "Dormitorio", href: "/productos?room=dormitorio", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&q=80&w=600" },
  { label: "Cocina", href: "/productos?room=cocina", image: "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&q=80&w=600" },
];

async function getProducts() {
  try {
    const data = await fetchProducts();
    return data.items || [];
  } catch {
    return [];
  }
}

// Componente asíncrono para los productos
async function ProductsSection() {
  const products = await getProducts();

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-sm text-[var(--gray-500)]">No hay productos disponibles en este momento.</p>
        <Link href="/mueblerias" className="mt-3 text-sm font-medium text-[var(--primary-600)] hover:underline">Ver mueblerías →</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {products.slice(0, 8).map((product: ProductListItem) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Amobly",
            url: "https://amobly.ar",
            logo: "https://amobly.ar/icon.png",
            description: "Catálogo de mueblerías de Córdoba con realidad aumentada y visualización 3D",
            areaServed: { "@type": "State", name: "Córdoba, Argentina" },
          }),
        }}
      />
      <div className="min-h-screen bg-[#f9fafb] pb-12 sm:pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#1c2925] border-b border-[#e1e6e3]/10">
        {/* Decorative Radial Gradients */}
        <div
          className="pointer-events-none absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #0b6e5e 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #e7a86e 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />
        <Container>
          <div className="grid items-center gap-10 py-12 lg:grid-cols-2 lg:gap-12 lg:py-16">
            {/* Text Content */}
            <div className="order-2 lg:order-1 relative z-10">
              <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-bold tracking-wider text-[#e7a86e]">
                Realidad Aumentada · 3D Interactivo
              </span>

              <h1 className="mt-5 text-3xl font-semibold leading-[1.2] text-white sm:text-4xl lg:text-5xl">
                Muebles para
                <span className="block text-[#e7a86e]">tu hogar</span>
              </h1>

              <p className="mt-4 text-base leading-relaxed text-white/70 lg:text-lg lg:max-w-xl">
                Descubrí muebles de tiendas locales, compará opciones y consultá directo por WhatsApp. Cuando el producto tiene 3D, también podés verlo en tu espacio con realidad aumentada.
              </p>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/productos"
                  className="inline-flex items-center justify-center gap-2 bg-[#e7a86e] px-6 py-3.5 text-sm font-semibold text-[#1c2421] transition-all hover:bg-[#d4944f] active:scale-95"
                >
                  Explorar catálogo
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/mueblerias"
                  className="inline-flex items-center justify-center border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10 active:scale-95"
                >
                  Ver mueblerías
                </Link>
              </div>

              {/* Value Props */}
              <div className="mt-10 flex gap-8 border-t border-white/10 pt-6">
                <div>
                  <p className="text-2xl font-bold text-[#e7a86e] sm:text-3xl">3D</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-white/50">Vista Interactiva</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#e7a86e] sm:text-3xl">AR</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-white/50">En tu casa</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white sm:text-3xl">CBA</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-white/50">Tiendas locales</p>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="order-1 flex items-center justify-center lg:order-2">
              <div className="relative w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[450px]">
                <img
                  src="/images/landing-hero.png"
                  alt="Living moderno con sillón de pana verde esmeralda y almohadones terracota"
                  className="w-full h-auto rounded-2xl shadow-2xl shadow-black/35 object-cover"
                />
                {/* Float Badge */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-white/95 px-3.5 py-2 shadow-lg backdrop-blur-sm">
                  <span className="flex h-2 w-2 rounded-full bg-[#0b6e5e] animate-pulse" />
                  <p className="text-xs font-semibold text-[#1c2421]">Proyección AR Activa</p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Benefits Bar */}
      <section className="bg-[#edf7f3]">
        <Container>
          <div className="flex overflow-x-auto py-3.5 gap-4 sm:gap-0 sm:py-4.5 sm:justify-around no-scrollbar">
            <div className="flex items-center gap-2 flex-shrink-0">
              <MessageCircle className="h-4 w-4 text-[#0b6e5e] sm:h-5 sm:w-5" />
              <span className="text-xs font-medium text-[#1c2421]/80 sm:text-sm">Consulta directa</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <MapPin className="h-4 w-4 text-[#0b6e5e] sm:h-5 sm:w-5" />
              <span className="text-xs font-medium text-[#1c2421]/80 sm:text-sm">Tiendas locales</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Cuboid className="h-4 w-4 text-[#e7a86e] sm:h-5 sm:w-5" />
              <span className="text-xs font-medium text-[#1c2421]/80 sm:text-sm">3D y AR</span>
            </div>
          </div>
        </Container>
      </section>

      {/* Rooms Section */}
      <section className="mt-6 sm:mt-10">
        <Container>
          <div className="rounded-2xl border border-[var(--gray-200)] bg-white p-4 shadow-sm sm:p-6 transition-all duration-300">
            <div className="mb-4 flex items-end justify-between sm:mb-6">
              <div>
                <h2 className="text-lg font-bold text-[var(--gray-900)] sm:text-2xl">Explorá por ambientes</h2>
                <p className="text-xs text-[var(--gray-500)] mt-1">Encontrá el mueble perfecto para cada rincón de tu casa</p>
              </div>
              <Link href="/productos" className="text-xs font-semibold text-[var(--primary-600)] hover:text-[#075247] hover:underline sm:text-sm">
                Ver todos
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
              {featuredRooms.map((room) => (
                <Link
                  key={room.href}
                  href={room.href}
                  className="group overflow-hidden rounded-xl border border-[var(--gray-200)]/80 shadow-sm"
                >
                  <div className="relative aspect-[16/10]">
                    <img
                      src={room.image}
                      alt={room.label}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-90" />
                    <span className="absolute bottom-3 left-3 text-xs font-bold text-white tracking-wide sm:bottom-4 sm:left-4 sm:text-sm">
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
      <section className="mt-6 sm:mt-10">
        <Container>
          <div className="rounded-2xl border border-[var(--gray-200)] bg-white p-4 shadow-sm sm:p-6 transition-all duration-300">
            <div className="mb-4 flex items-end justify-between sm:mb-6">
              <div>
                <h2 className="text-lg font-bold text-[var(--gray-900)] sm:text-2xl">Productos destacados</h2>
                <p className="text-xs text-[var(--gray-500)] mt-1">Nuestra selección de piezas exclusivas para vos</p>
              </div>
              <Link
                href="/productos"
                className="text-xs font-semibold text-[var(--primary-600)] hover:text-[#075247] hover:underline sm:text-sm"
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
    </>
  );
}
