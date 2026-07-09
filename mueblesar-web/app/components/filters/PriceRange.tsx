"use client";

import { useEffect, useState } from "react";

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

type Props = {
  min?: number;
  max?: number;
  defaultMin?: number;
  defaultMax?: number;
};

export function PriceRange({ min = 0, max = 200000, defaultMin, defaultMax }: Props) {
  const [from, setFrom] = useState(defaultMin ?? min);
  const [to, setTo] = useState(defaultMax ?? max);

  useEffect(() => {
    setFrom(defaultMin ?? min);
    setTo(defaultMax ?? max);
  }, [defaultMin, defaultMax, min, max]);

  const handleFrom = (value: number) => {
    const next = clamp(value, min, to);
    setFrom(next);
  };

  const handleTo = (value: number) => {
    const next = clamp(value, from, max);
    setTo(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 text-sm text-slate-700">
        <label className="font-semibold text-slate-800">Precio</label>
        <span className="text-xs text-slate-500">${from.toLocaleString("es-AR")} - ${to.toLocaleString("es-AR")}</span>
      </div>
      <div className="space-y-2">
        <input
          type="range"
          min={min}
          max={max}
          value={from}
          onChange={(e) => handleFrom(Number(e.target.value))}
          className="w-full"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={to}
          onChange={(e) => handleTo(Number(e.target.value))}
          className="w-full"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          name="priceMin"
          type="number"
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          value={from}
          onChange={(e) => handleFrom(Number(e.target.value))}
        />
        <input
          name="priceMax"
          type="number"
          className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          value={to}
          onChange={(e) => handleTo(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
