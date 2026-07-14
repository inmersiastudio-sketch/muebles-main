import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchStoreBySlug } from "@/app/lib/api";
import { Container } from "@/app/components/layout/Container";
import { ProductCard } from "@/app/components/products/ProductCard";
import { EmptyProducts } from "@/app/components/ui/EmptyState";
import {
  MapPin,
  MessageCircle,
  Phone,
  Mail,
  Globe,
  Instagram,
  Store,
  Package,
  Clock,
  ArrowRight,
  ChevronRight,
  Cuboid,
} from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchStoreBySlug(slug);

  if (!data) {
    return { title: "Mueblería no encontrada | Amobly" };
  }

  return {
    title: `${data.store.name} | Amobly`,
    description: data.store.description || `Catálogo de ${data.store.name} en Amobly`,
    openGraph: {
      title: `${data.store.name} | Amobly`,
      description: data.store.description || `Catálogo de ${data.store.name}`,
      images: data.store.logoUrl ? [{ url: data.store.logoUrl }] : [],
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

function formatWhatsApp(whatsapp: string): string {
  return whatsapp.replace(/\D/g, "");
}

export default async function StoreProfilePage({ params }: Props) {
  const { slug } = await params;
  const data = await fetchStoreBySlug(slug);

  if (!data) {
    notFound();
  }

  const { store, products } = data;
  const totalProducts = store._count?.products ?? products.length;

  const hasAr = (p: typeof products[number]): boolean => {
    const raw = p as unknown as Record<string, unknown>;
    return Boolean(raw.glbUrl || raw.usdzUrl || raw.hasAr || (Array.isArray(raw.media) && (raw.media as Array<Record<string, unknown>>).some((m: Record<string, unknown>) => m.type === "MODEL_3D")));
  };

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* ========== HERO / BANNER ========== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#f5efe8] via-[#ede7dd] to-[#e8e0d4]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDFkM2QiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#faf8f5]/80 via-transparent to-transparent" />

        <Container>
          <div className="relative pt-8 pb-12 md:pt-12 md:pb-16">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-[#8b7d6b] mb-6">
              <Link href="/mueblerias" className="hover:text-[#001d3d] transition-colors">
                Mueblerías
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="font-medium text-[#001d3d]">{store.name}</span>
            </div>

            {/* Store Identity */}
            <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-8">
              {/* Logo */}
              <div className="relative -mb-8 md:-mb-12 z-10">
                {store.logoUrl ? (
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-2 border-white shadow-xl bg-white ring-2 ring-white/50">
                    <Image
                      src={store.logoUrl}
                      alt={store.name}
                      width={112}
                      height={112}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-[#001d3d] flex items-center justify-center border-2 border-white shadow-xl ring-2 ring-white/50">
                    <span className="text-3xl md:text-4xl font-bold text-white">
                      {getInitials(store.name)}
                    </span>
                  </div>
                )}
              </div>

              {/* Name + Description */}
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center gap-2 text-xs font-medium text-[#8b7d6b] mb-1.5">
                  <Store className="w-3.5 h-3.5" />
                  <span>Mueblería verificada</span>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1a1a2e] tracking-tight">
                  {store.name}
                </h1>
                {store.description && (
                  <p className="mt-2 text-sm md:text-base text-[#6b5d4e] max-w-2xl leading-relaxed">
                    {store.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ========== INFO BAR ========== */}
      <section className="bg-white border-b border-[#e8e0d4]">
        <Container>
          <div className="py-4 md:py-5">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
              {store.address && (
                <div className="flex items-center gap-2 text-[#4a3f35]">
                  <div className="w-8 h-8 rounded-full bg-[#f5efe8] flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-[#8b7d6b]" />
                  </div>
                  <span>{store.address}{store.city ? `, ${store.city}` : ""}</span>
                </div>
              )}

              {store.whatsapp && (
                <a
                  href={`https://wa.me/${formatWhatsApp(store.whatsapp)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#4a3f35] hover:text-[#25d366] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#f0fdf4] flex items-center justify-center group-hover:bg-[#dcfce7] transition-colors">
                    <MessageCircle className="w-4 h-4 text-[#25d366]" />
                  </div>
                  <span>WhatsApp</span>
                </a>
              )}

              {store.phone && store.phone !== store.whatsapp && (
                <a
                  href={`tel:${store.phone}`}
                  className="flex items-center gap-2 text-[#4a3f35] hover:text-[#001d3d] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#f5efe8] flex items-center justify-center group-hover:bg-[#ede7dd] transition-colors">
                    <Phone className="w-4 h-4 text-[#8b7d6b]" />
                  </div>
                  <span>{store.phone}</span>
                </a>
              )}

              {store.email && (
                <a
                  href={`mailto:${store.email}`}
                  className="flex items-center gap-2 text-[#4a3f35] hover:text-[#001d3d] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#f5efe8] flex items-center justify-center group-hover:bg-[#ede7dd] transition-colors">
                    <Mail className="w-4 h-4 text-[#8b7d6b]" />
                  </div>
                  <span className="hidden sm:inline">{store.email}</span>
                  <span className="sm:hidden">Email</span>
                </a>
              )}

              {store.website && (
                <a
                  href={store.website.startsWith("http") ? store.website : `https://${store.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#4a3f35] hover:text-[#001d3d] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#f5efe8] flex items-center justify-center group-hover:bg-[#ede7dd] transition-colors">
                    <Globe className="w-4 h-4 text-[#8b7d6b]" />
                  </div>
                  <span className="hidden sm:inline">Sitio web</span>
                  <span className="sm:hidden">Web</span>
                </a>
              )}

              {store.socialInstagram && (
                <a
                  href={`https://instagram.com/${store.socialInstagram.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#4a3f35] hover:text-[#e4405f] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#fef2f2] flex items-center justify-center group-hover:bg-[#ffe4e6] transition-colors">
                    <Instagram className="w-4 h-4 text-[#e4405f]" />
                  </div>
                  <span>{store.socialInstagram.startsWith("@") ? store.socialInstagram : `@${store.socialInstagram}`}</span>
                </a>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* ========== STATS BANNER ========== */}
      <section className="border-b border-[#e8e0d4] bg-white/50">
        <Container>
          <div className="py-5 flex items-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#8b7d6b]" />
              <span className="text-[#4a3f35]">
                <strong className="text-[#1a1a2e]">{totalProducts}</strong>{" "}
                {totalProducts === 1 ? "producto" : "productos"}
              </span>
            </div>
            {store.city && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#8b7d6b]" />
                <span className="text-[#4a3f35]">{store.city}{store.province ? `, ${store.province}` : ""}</span>
              </div>
            )}
            {store.whatsapp && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#8b7d6b]" />
                <span className="text-[#4a3f35]">Responde en minutos</span>
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* ========== PRODUCTS ========== */}
      <Container>
        <div className="py-8 md:py-10">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-[#1a1a2e] tracking-tight">
                Catálogo
              </h2>
              <p className="text-sm text-[#8b7d6b] mt-0.5">
                {totalProducts} {totalProducts === 1 ? "producto disponible" : "productos disponibles"}
              </p>
            </div>
            <Link
              href={`/catalog/${slug}`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#001d3d] hover:text-[#003566] transition-colors group"
            >
              Ver catálogo completo
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#e0d5c8] bg-white p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-[#f5efe8] flex items-center justify-center mx-auto mb-4">
                <Package className="w-7 h-7 text-[#b8a99a]" />
              </div>
              <h3 className="text-lg font-semibold text-[#1a1a2e]">Esta mueblería aún no publicó productos</h3>
              <p className="mt-1 text-sm text-[#8b7d6b]">Pronto van a estar disponibles en Amobly.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {products.slice(0, 8).map((product) => {
                const ar = hasAr(product);
                return (
                  <ProductCard
                    key={product.id}
                    product={{
                      ...product,
                      store: { name: store.name, slug: store.slug },
                      hasAr: ar,
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* View All CTA */}
          {products.length > 8 && (
            <div className="mt-8 text-center">
              <Link
                href={`/catalog/${slug}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#001d3d] text-white font-semibold text-sm hover:bg-[#003566] transition-colors shadow-lg shadow-[#001d3d]/10"
              >
                Ver los {totalProducts} productos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </Container>

      {/* ========== ABOUT SECTION ========== */}
      {store.description && (
        <section className="border-t border-[#e8e0d4] bg-white">
          <Container>
            <div className="py-10 md:py-14">
              <div className="max-w-3xl">
                <h2 className="text-lg font-bold text-[#1a1a2e] mb-3 tracking-tight">
                  Sobre {store.name}
                </h2>
                <p className="text-sm md:text-base text-[#6b5d4e] leading-relaxed">
                  {store.description}
                </p>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ========== CTA ========== */}
      {store.whatsapp && (
        <section className="border-t border-[#e8e0d4] bg-[#faf8f5]">
          <Container>
            <div className="py-10 md:py-12">
              <div className="rounded-2xl bg-gradient-to-r from-[#001d3d] to-[#003566] p-8 md:p-10 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-white">
                      ¿Consultas sobre un producto?
                    </h3>
                    <p className="mt-1 text-sm text-[#8ab4e0]">
                      {store.name} te responde directo por WhatsApp
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/${formatWhatsApp(store.whatsapp)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#25d366] text-white font-semibold text-sm hover:bg-[#22c55e] transition-colors shadow-lg shadow-[#25d366]/20 shrink-0"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Escribinos
                  </a>
                </div>
              </div>
            </div>
          </Container>
        </section>
      )}
    </div>
  );
}
