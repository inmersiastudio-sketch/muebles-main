import { Info, Truck } from "lucide-react";

export function ShippingCalculator() {
  return (
    <section className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm" aria-labelledby="shipping-title">
      <h3 id="shipping-title" className="mb-2 flex items-center gap-2 font-bold text-[#0f172a]">
        <Truck className="h-5 w-5 text-[#1d4ed8]" aria-hidden="true" />
        Envío
      </h3>
      <p className="text-sm text-[#64748b]">
        El costo y el plazo de envío están a confirmar con la tienda.
      </p>
      <p className="mt-4 flex items-start gap-2 text-sm font-medium text-[#475569]" role="status">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#1d4ed8]" aria-hidden="true" />
        A confirmar con la tienda.
      </p>
    </section>
  );
}
