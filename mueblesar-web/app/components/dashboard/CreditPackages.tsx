"use client";

import { useState } from "react";
import { CheckCircle2, CreditCard, Loader2, Sparkles } from "lucide-react";

const PACKAGES = [
  {
    id: "pack-bronze",
    credits: 10,
    price: 1500,
    popular: false,
    description: "Ideal para probar el pipeline 3D",
  },
  {
    id: "pack-silver",
    credits: 50,
    price: 6000,
    popular: true,
    description: "Recomendado para colecciones medianas",
  },
  {
    id: "pack-gold",
    credits: 120,
    price: 12000,
    popular: false,
    description: "Máximo ahorro para catálogos masivos",
  },
] as const;

type Props = {
  currentCredits: number;
  apiBase: string;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(value);
}

export function CreditPackages({ currentCredits, apiBase }: Props) {
  const [loadingPackId, setLoadingPackId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async (packId: string) => {
    setLoadingPackId(packId);
    setError(null);

    try {
      const response = await fetch(`${apiBase}/api/payments/purchase-credits`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ packageId: packId }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || data.error || "Error al inicializar Mercado Pago.");
      }

      if (typeof data.initPoint === "string" && data.initPoint.length > 0) {
        window.location.href = data.initPoint;
        return;
      }

      throw new Error("El servidor no devolvió una URL de checkout válida.");
    } catch (err) {
      console.error("Checkout Error:", err);
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado al procesar el pago.");
      setLoadingPackId(null);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-neutral-800 bg-gradient-to-r from-neutral-950 to-neutral-800 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
              <Sparkles className="h-5 w-5 text-amber-400" />
              Saldo de créditos de IA
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-neutral-400">
              Cada crédito permite procesar un mueble a través del pipeline de IA generativa y publicar assets .glb/.usdz.
            </p>
          </div>
          <div className="min-w-[150px] rounded-xl border border-white/10 bg-white/10 px-6 py-3 text-left backdrop-blur md:text-right">
            <span className="block text-[10px] font-medium uppercase tracking-wider text-neutral-400">Disponibles</span>
            <span className="font-mono text-2xl font-bold text-amber-400">{currentCredits}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {PACKAGES.map((pack) => {
          const isLoading = loadingPackId === pack.id;

          return (
            <article
              key={pack.id}
              className={`relative flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-sm transition-all ${
                pack.popular
                  ? "border-[#0058a3] shadow-[#0058a3]/10 ring-1 ring-[#0058a3]"
                  : "border-neutral-200 hover:border-neutral-300 hover:shadow-md"
              }`}
            >
              {pack.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#0058a3] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                  Más vendido
                </span>
              )}

              <div>
                <div className="mb-2 flex items-start justify-between gap-3">
                  <h3 className="text-lg font-bold text-neutral-900">{pack.credits} créditos</h3>
                  <span className="rounded-full bg-neutral-100 px-2.5 py-1 font-mono text-xs font-medium text-neutral-600">
                    IA Pack
                  </span>
                </div>

                <p className="mb-6 text-xs leading-relaxed text-neutral-500">{pack.description}</p>

                <div className="mb-6">
                  <span className="text-3xl font-extrabold tracking-tight text-neutral-900">
                    {formatPrice(pack.price)}
                  </span>
                  <span className="ml-1 text-xs font-medium text-neutral-400">ARS</span>
                  <span className="mt-1 block font-mono text-[10px] text-neutral-400">
                    {formatPrice(pack.price / pack.credits)} por modelo generado
                  </span>
                </div>

                <ul className="mb-8 space-y-2.5 text-xs text-neutral-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    <span>Modelado asíncrono optimizado (.glb/.usdz)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    <span>Reembolso automático si falla el vendor externo</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => handlePurchase(pack.id)}
                disabled={loadingPackId !== null}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white transition-colors ${
                  pack.popular ? "bg-[#0058a3] hover:bg-[#004f93]" : "bg-neutral-900 hover:bg-black"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Procesando checkout...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Comprar con Mercado Pago
                  </>
                )}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default CreditPackages;
