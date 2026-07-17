import Link from "next/link";
import { Container } from "../components/layout/Container";
import { StoreCard } from "../components/store/StoreCard";
import { fetchStores } from "../lib/api";
import type { Store } from "@/types";
import { EmptyStores } from "../components/ui/EmptyState";
import { Building2, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Mueblerías Aliadas | Amobly",
  description: "Descubrí las mejores mueblerías de Córdoba. Catálogos digitales con realidad aumentada.",
};

export default async function StoresPage() {
  const { items } = await fetchStores();

  return (
    <div className="min-h-screen bg-[#f9fafb] pb-12 sm:pb-16">
      {/* Hero Section */}
      <div className="bg-[#1c2925] text-white border-b border-[#e1e6e3]/10 relative overflow-hidden">
        {/* Decorative elements */}
        <div
          className="pointer-events-none absolute -right-36 -top-36 h-[500px] w-[500px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #0b6e5e 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />
        <Container>
          <div className="py-12 md:py-16 relative z-10">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#e7a86e]">
                <Building2 className="w-3.5 h-3.5" />
                <span>Directorio oficial</span>
              </div>
              <h1 className="mt-3 text-3xl md:text-4xl font-bold uppercase tracking-wider text-white">
                Mueblerías aliadas
              </h1>
              <p className="mt-4 text-sm md:text-base leading-relaxed text-white/70">
                Explorá el catálogo digital de las mueblerías de Córdoba. 
                Visualizá sus piezas en tu hogar con realidad aumentada 3D y consultá de manera directa.
              </p>
            </div>
          </div>
        </Container>
      </div>

      {/* Stats Bar */}
      <div className="bg-[#edf7f3] border-b border-[#e1e6e3]/60">
        <Container>
          <div className="flex items-center gap-2 py-3.5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#1c2421]/80">
            <span className="text-[#0b6e5e] font-bold">{items.length}</span>
            <span>mueblerías verificadas</span>
          </div>
        </Container>
      </div>

      {/* Stores Grid */}
      <Container>
        <div className="py-8 sm:py-12">
          {items.length === 0 ? (
            <EmptyStores />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((store: Store) => (
                <StoreCard key={store.id} store={store} variant="default" />
              ))}
            </div>
          )}
        </div>
      </Container>

      {/* CTA Section */}
      <div className="bg-[#f9fafb] border-t border-[#e1e6e3]/60 pt-6">
        <Container>
          <div className="py-6">
            <div className="relative overflow-hidden bg-[#0b6e5e] px-6 py-8 md:px-12 md:py-10">
              <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider text-white">
                    ¿Tenés una mueblería?
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/80 max-w-xl">
                    Publicá tu catálogo en Amobly. Generá modelos 3D y de realidad aumentada a partir de tus fotos y recibí consultas directas.
                  </p>
                </div>
                <Link
                  href="/registrar"
                  className="inline-flex items-center justify-center gap-2 bg-[#e7a86e] px-6 py-3 text-sm font-bold uppercase tracking-wider text-[#1c2421] transition hover:bg-[#d4944f]"
                >
                  Empezar gratis
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}
