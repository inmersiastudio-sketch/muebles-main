"use client";

import { useState } from "react";
import { Truck, Calculator, Info } from "lucide-react";

export function ShippingCalculator() {
  const [postalCode, setPostalCode] = useState("");
  const [calculated, setCalculated] = useState(false);

  const handleCalculate = () => {
    if (postalCode.length >= 4) {
      setCalculated(true);
    }
  };

  return (
    <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 font-bold text-[#0f172a]">
        <Calculator className="h-5 w-5 text-[#1d4ed8]" />
        Calculador de Envío
      </h3>

      <p className="mb-4 text-sm text-[#64748b]">
        Ingresá tu código postal para conocer el costo y tiempo de entrega en tu hogar.
      </p>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Ej: 1425"
          value={postalCode}
          onChange={(e) => { setCalculated(false); setPostalCode(e.target.value); }}
          className="flex-1 rounded-xl border border-[#cbd5e1] px-4 py-2 text-sm focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
        />
        <button
          onClick={handleCalculate}
          className="rounded-xl bg-[#1d4ed8] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1e40af]"
        >
          Calcular
        </button>
      </div>

      {calculated && (
        <div className="mb-3 rounded-xl border border-[#bfdbfe] bg-[#eff6ff] p-3">
          <div className="flex items-center gap-2 text-[#1e40af]">
            <Truck className="h-4 w-4" />
            <span className="text-sm font-semibold">Envío gratis a tu zona</span>
          </div>
          <p className="mt-1 text-xs text-[#2563eb]">Entrega estimada: 3-5 días hábiles</p>
        </div>
      )}

      <div className="flex items-start gap-2 text-xs text-[#64748b]">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <p>Envíos a CABA se realizan los días Martes y Jueves entre las 09:00 y 18:00 hs.</p>
      </div>
    </div>
  );
}
