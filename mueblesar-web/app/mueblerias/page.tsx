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
    <div className="min-h-screen bg-[#f1f5f9]">
      {/* Hero Section */}
      <div className="bg-white border-b border-[#e2e8f0]">
        <Container>
          <div className="py-8 md:py-12">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-medium text-[#64748b]">
                <Building2 className="w-3.5 h-3.5" />
                <span>Directorio de comercios</span>
              </div>
              <h1 className="mt-2 text-2xl md:text-3xl font-bold text-[#0f172a]">
                Mueblerías aliadas
              </h1>
              <p className="mt-3 text-sm md:text-base text-[#64748b]">
                Explorá el catálogo digital de las mejores mueblerías de Córdoba. 
                Visualizá los productos en tu espacio con realidad aumentada.
              </p>
            </div>
          </div>
        </Container>
      </div>

      {/* Stats Bar */}
      <div className="bg-[#f8fafc] border-b border-[#e2e8f0]">
        <Container>
          <div className="flex items-center gap-2 py-3 text-sm text-[#64748b]">
            <span className="font-semibold text-[#0f172a]">{items.length}</span>
            <span>mueblerías disponibles</span>
          </div>
        </Container>
      </div>

      {/* Stores Grid */}
      <Container>
        <div className="py-6">
          {items.length === 0 ? (
            <EmptyStores />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((store: Store) => (
                <StoreCard key={store.id} store={store} variant="default" />
              ))}
            </div>
          )}
        </div>
      </Container>

      {/* CTA Section */}
      <div className="bg-white border-t border-[#e2e8f0]">
        <Container>
          <div className="py-8">
            <div className="rounded-xl bg-[#1d4ed8] px-6 py-8 md:px-10 md:py-10">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-white">
                    ¿Tenés una mueblería?
                  </h2>
                  <p className="mt-1 text-sm text-blue-100">
                    Unite a la plataforma y llegá a más clientes con catálogos digitales en AR.
                  </p>
                </div>
                <Link
                  href="/contacto"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-[#1d4ed8] transition hover:bg-blue-50"
                >
                  Contactanos
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
