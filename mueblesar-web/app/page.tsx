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
  { label: "Cocina", href: "/productos?room=cocina", image: "https://images.unsplash.com/photo-1556911220-bda9f7f7597e?auto=format&fit=crop&q=80&w=600" },
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
    <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
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
      <div className="min-h-screen bg-[var(--gray-100)] pb-8 sm:pb-12">
      {/* Hero Section */}
      <section className="bg-white">
        <Container>
          <div className="grid items-center gap-6 py-8 lg:grid-cols-2 lg:gap-12 lg:py-12">
            {/* Text Content */}
            <div className="order-2 lg:order-1">
              <span className="inline-flex items-center rounded-full bg-[var(--primary-100)] px-3 py-1 text-xs font-bold tracking-wider text-[var(--primary-700)]">
                Realidad Aumentada · 3D Interactivo
              </span>

              <h1 className="mt-4 text-3xl font-extrabold leading-tight text-[var(--gray-900)] sm:text-4xl lg:text-5xl">
                Muebles para
                <span className="block text-[var(--primary-600)]">tu hogar</span>
              </h1>

              <p className="mt-4 text-base leading-relaxed text-[var(--gray-600)] lg:text-lg lg:max-w-xl">
                Descubrí muebles de tiendas locales, compará opciones y consultá directo por WhatsApp. Cuando el producto tiene 3D, también podés verlo en tu espacio con realidad aumentada.
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
                  href="/mueblerias"
                  className="inline-flex items-center justify-center rounded-xl border border-[var(--gray-300)] bg-[var(--gray-100)] px-6 py-3 text-sm font-semibold text-[var(--gray-800)] transition-colors hover:bg-[var(--gray-200)] active:scale-95"
                >
                  Ver mueblerías
                </Link>
              </div>

              {/* Value Props */}
              <div className="mt-8 flex gap-6 border-t border-[var(--gray-200)] pt-6">
                <div>
                  <p className="text-2xl font-extrabold text-[var(--primary-600)] sm:text-3xl">3D</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--gray-500)]">Vista Interactiva</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-[var(--primary-600)] sm:text-3xl">AR</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--gray-500)]">En tu casa</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-[var(--gray-900)] sm:text-3xl">CBA</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[var(--gray-500)]">Mueblerías locales</p>
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
              <MessageCircle className="h-4 w-4 text-[var(--success-600)] sm:h-5 sm:w-5" />
              <span className="text-xs font-medium text-[var(--gray-700)] sm:text-sm">Consulta directa</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <MapPin className="h-4 w-4 text-[var(--primary-600)] sm:h-5 sm:w-5" />
              <span className="text-xs font-medium text-[var(--gray-700)] sm:text-sm">Tiendas locales</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Cuboid className="h-4 w-4 text-[var(--warning-500)] sm:h-5 sm:w-5" />
              <span className="text-xs font-medium text-[var(--gray-700)] sm:text-sm">3D y AR</span>
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
    </>
  );
}
