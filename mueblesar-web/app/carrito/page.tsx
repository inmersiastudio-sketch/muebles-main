"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MessageCircle, Trash2 } from "lucide-react";
import { Container } from "../components/layout/Container";
import {
  clearLegacySavedProducts,
  createWhatsAppInquiryUrl,
  getLegacySavedProducts,
  groupProductsByStore,
  removeLegacyStoreGroup,
  type InquiryProduct,
} from "../lib/cart";

export default function CartPage() {
  const [savedProducts, setSavedProducts] = useState<InquiryProduct[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setSavedProducts(getLegacySavedProducts());
    setIsReady(true);
  }, []);

  const storeGroups = useMemo(
    () => groupProductsByStore(savedProducts),
    [savedProducts]
  );

  const removeStoreGroup = (storeId: string) => {
    removeLegacyStoreGroup(storeId);
    setSavedProducts((products) =>
      products.filter((product) => (product.storeSlug || product.storeName || String(product.id)) !== storeId)
    );
  };

  const clearSavedProducts = () => {
    clearLegacySavedProducts();
    setSavedProducts([]);
  };

  if (!isReady) {
    return <div className="min-h-[40vh]" />;
  }

  return (
    <div className="py-10 md:py-16">
      <Container>
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Consultas guardadas</h1>
            <p className="mt-2 text-slate-600">
              Las consultas se envian directamente a cada muebleria.
            </p>
          </div>

          {storeGroups.length === 0 ? (
            <div className="border-y border-slate-200 py-12 text-center">
              <MessageCircle className="mx-auto mb-3 h-8 w-8 text-slate-400" aria-hidden="true" />
              <p className="font-semibold text-slate-900">No hay productos guardados para consultar.</p>
              <Link
                href="/productos"
                className="mt-5 inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 font-medium text-white transition-colors hover:bg-primary/90"
              >
                Ver productos
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {storeGroups.map((group) => {
                const whatsAppUrl = createWhatsAppInquiryUrl(group.storeWhatsapp, group.items);

                return (
                  <section key={group.id} className="border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">{group.storeName}</h2>
                        <p className="mt-1 text-sm text-slate-600">
                          {group.items.length} {group.items.length === 1 ? "producto" : "productos"} para consultar
                        </p>
                      </div>
                      {whatsAppUrl ? (
                        <a
                          href={whatsAppUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => removeStoreGroup(group.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                        >
                          <MessageCircle className="h-4 w-4" aria-hidden="true" />
                          Consultar por WhatsApp
                        </a>
                      ) : (
                        <Link
                          href={group.storeSlug ? `/catalog/${group.storeSlug}` : "/productos"}
                          className="inline-flex items-center justify-center rounded-lg border border-primary px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
                        >
                          Enviar consulta
                        </Link>
                      )}
                    </div>

                    <ul className="divide-y divide-slate-100">
                      {group.items.map((item) => (
                        <li key={item.id} className="flex items-center gap-3 py-3">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-14 w-14 object-cover"
                            />
                          )}
                          <Link
                            href={group.storeSlug ? `/catalog/${group.storeSlug}/${item.slug}` : `/productos/${item.slug}`}
                            className="min-w-0 font-medium text-slate-900 hover:text-primary"
                          >
                            <span className="block truncate">{item.name}</span>
                            {item.quantity && item.quantity > 1 && (
                              <span className="mt-0.5 block text-sm font-normal text-slate-500">Cantidad: {item.quantity}</span>
                            )}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}

              <button
                type="button"
                onClick={clearSavedProducts}
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Quitar productos guardados
              </button>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
