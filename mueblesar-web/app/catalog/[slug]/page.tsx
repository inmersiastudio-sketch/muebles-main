export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchCatalogBySlug, type CatalogFilters } from "@/app/lib/api";
import { Container } from "@/app/components/layout/Container";
import { ProductCard } from "@/app/components/products/ProductCard";
import { EmptyProducts } from "@/app/components/ui/EmptyState";
import { CatalogFilters as CatalogFiltersUI } from "./CatalogFilters";
import { ArrowLeft, MessageCircle, MapPin, Phone, Store } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    category?: string;
    room?: string;
    style?: string;
    priceMin?: string;
    priceMax?: string;
    page?: string;
    sort?: string;
    direction?: string;
    pageSize?: string;
    arOnly?: string;
  }>;
}

const categories = [
  { value: "sofas", label: "Sofás" },
  { value: "mesas", label: "Mesas" },
  { value: "sillas", label: "Sillas" },
  { value: "almacenamiento", label: "Almacenamiento" },
];

const rooms = [
  { value: "living", label: "Living" },
  { value: "comedor", label: "Comedor" },
  { value: "dormitorio", label: "Dormitorio" },
  { value: "cocina", label: "Cocina" },
  { value: "oficina", label: "Oficina" },
  { value: "exterior", label: "Exterior" },
];

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const response = await fetchCatalogBySlug(slug);
  const catalog = response?.data;

  if (!catalog) {
    return {
      title: "Catálogo no encontrado | Amobly",
    };
  }

  return {
    title: `${catalog.store.name} | Catálogo`,
    description: catalog.store.description || `Explora el catálogo de ${catalog.store.name}`,
    openGraph: {
      title: `${catalog.store.name} | Catálogo`,
      description: catalog.store.description || `Explora el catálogo de ${catalog.store.name}`,
      type: "website",
    },
  };
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default async function CatalogPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const paramsAwaited = await searchParams;

  // Build filters
  const filters: CatalogFilters = {
    category: paramsAwaited.category,
    room: paramsAwaited.room,
    style: paramsAwaited.style,
    priceMin: paramsAwaited.priceMin ? Number(paramsAwaited.priceMin) : undefined,
    priceMax: paramsAwaited.priceMax ? Number(paramsAwaited.priceMax) : undefined,
    page: paramsAwaited.page ? Number(paramsAwaited.page) : 1,
    pageSize: paramsAwaited.pageSize ? Number(paramsAwaited.pageSize) : 12,
    sort: paramsAwaited.sort === "price" ? "price" : "createdAt",
    direction: paramsAwaited.direction === "asc" ? "asc" : "desc",
    arOnly: paramsAwaited.arOnly === "true",
  };

  const response = await fetchCatalogBySlug(slug, filters);

  if (!response) {
    notFound();
  }

  const { store, products, pagination } = response.data;
  const currentPage = pagination.page;
  const totalPages = pagination.totalPages;
  const total = pagination.total;

  const hasFilters = Boolean(
    paramsAwaited.category ||
    paramsAwaited.room ||
    paramsAwaited.style ||
    paramsAwaited.priceMin ||
    paramsAwaited.priceMax ||
    paramsAwaited.arOnly
  );

  return (
    <div className="min-h-screen bg-[var(--gray-100)]">
      {/* Back Link */}
      <div className="bg-white border-b border-[var(--gray-200)]">
        <Container>
          <div className="flex h-12 items-center">
            <Link
              href="/mueblerias"
              className="flex items-center gap-1.5 text-sm text-[#64748b] hover:text-[#0f172a] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a mueblerías</span>
            </Link>
          </div>
        </Container>
      </div>

      {/* Store Header */}
      <div className="bg-white border-b border-[var(--gray-200)]">
        <Container>
          <div className="py-6 md:py-8">
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
              {/* Store Logo */}
              <div className="flex-shrink-0">
                {store.logoUrl ? (
                  <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border border-[var(--gray-200)] bg-white shadow-sm">
                    <Image
                      src={store.logoUrl}
                      alt={store.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-[var(--gray-100)] flex items-center justify-center border border-[var(--gray-200)]">
                    <span className="text-2xl md:text-3xl font-bold text-[var(--gray-500)]">
                      {getInitials(store.name)}
                    </span>
                  </div>
                )}
              </div>

              {/* Store Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-[var(--gray-500)] mb-1">
                  <Store className="w-3.5 h-3.5" />
                  <span>Catálogo de mueblería</span>
                </div>
                <h1 className="text-xl md:text-2xl font-bold text-[var(--gray-900)]">
                  {store.name}
                </h1>
                {store.description && (
                  <p className="mt-1 text-sm text-[var(--gray-500)] max-w-2xl line-clamp-2">
                    {store.description}
                  </p>
                )}

                {/* Contact Info */}
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--gray-500)]">
                  {store.address && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {store.address}
                    </span>
                  )}
                  {store.whatsapp && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {store.whatsapp}
                    </span>
                  )}
                </div>
              </div>

              {/* Contact Button */}
              {store.whatsapp && (
                <div className="flex-shrink-0">
                  <a
                    href={`https://wa.me/${store.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[var(--success-600)] hover:bg-[#15803d] text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Contactar</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>

      {/* Products Section */}
      <Container>
        <div className="py-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-[var(--gray-900)]">
                Catálogo de Productos
              </h2>
              <p className="text-sm text-[var(--gray-500)]">
                {total} {total === 1 ? "producto" : "productos"} disponibles
              </p>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--gray-500)]">
                  Página {currentPage} de {totalPages}
                </span>
                <div className="flex gap-1">
                  <Link
                    href={{ pathname: `/catalog/${slug}`, query: { ...paramsAwaited, page: Math.max(1, currentPage - 1) } }}
                    className={`inline-flex h-9 px-3 items-center justify-center rounded-lg border border-[var(--gray-200)] text-sm font-medium text-[var(--gray-900)] transition hover:border-[var(--gray-300)] ${currentPage <= 1 ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    Anterior
                  </Link>
                  <Link
                    href={{ pathname: `/catalog/${slug}`, query: { ...paramsAwaited, page: Math.min(totalPages, currentPage + 1) } }}
                    className={`inline-flex h-9 px-3 items-center justify-center rounded-lg border border-[var(--gray-200)] text-sm font-medium text-[var(--gray-900)] transition hover:border-[var(--gray-300)] ${currentPage >= totalPages ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    Siguiente
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Filters */}
          <CatalogFiltersUI
            slug={slug}
            categories={categories}
            rooms={rooms}
            currentCategory={paramsAwaited.category}
            currentRoom={paramsAwaited.room}
            currentSort={paramsAwaited.sort}
            currentDirection={paramsAwaited.direction}
          />

          {/* Products Grid */}
          {products.length === 0 ? (
            hasFilters ? (
              <div className="rounded-xl border border-dashed border-[var(--gray-300)] bg-white p-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--gray-100)] mx-auto mb-4">
                  <Store className="h-7 w-7 text-[var(--gray-400)]" />
                </div>
                <h3 className="text-lg font-semibold text-[var(--gray-900)]">
                  No se encontraron productos
                </h3>
                <p className="mt-2 text-sm text-[var(--gray-500)] max-w-sm mx-auto">
                  No hay productos que coincidan con los filtros aplicados.
                </p>
                <Link
                  href={`/catalog/${slug}`}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary-600)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-700)]"
                >
                  Limpiar filtros
                </Link>
              </div>
            ) : (
              <EmptyProducts />
            )
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    category: product.category || '',
                    room: product.room || undefined,
                    price: product.price,
                    originalPrice: product.originalPrice,
                    currency: product.currency || 'ARS',
                    imageUrl: product.imageUrl || undefined,
                    store: { name: store.name, slug },
                    inStock: product.inStock || false,
                    hasDiscount: product.hasDiscount,
                    discountPercentage: product.discountPercentage,
                  }}
                />
              ))}
            </div>
          )}

          {/* Bottom Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Link
                href={{ pathname: `/catalog/${slug}`, query: { ...paramsAwaited, page: Math.max(1, currentPage - 1) } }}
                className={`inline-flex h-10 px-4 items-center justify-center rounded-lg border border-[var(--gray-200)] text-sm font-medium text-[var(--gray-900)] transition hover:border-[var(--gray-300)] ${currentPage <= 1 ? 'opacity-50 pointer-events-none' : ''}`}
              >
                Anterior
              </Link>
              <span className="px-4 text-sm text-[var(--gray-500)]">
                Página {currentPage} de {totalPages}
              </span>
              <Link
                href={{ pathname: `/catalog/${slug}`, query: { ...paramsAwaited, page: Math.min(totalPages, currentPage + 1) } }}
                className={`inline-flex h-10 px-4 items-center justify-center rounded-lg border border-[var(--gray-200)] text-sm font-medium text-[var(--gray-900)] transition hover:border-[var(--gray-300)] ${currentPage >= totalPages ? 'opacity-50 pointer-events-none' : ''}`}
              >
                Siguiente
              </Link>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
