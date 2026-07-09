"use client";

import { useState, useEffect, useCallback } from "react";

interface PriceRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
}

export function PriceRangeSlider({
  min,
  max,
  value,
  onChange,
  step = 10000,
}: PriceRangeSliderProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isDragging, setIsDragging] = useState<"min" | "max" | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleMinChange = useCallback(
    (newMin: number) => {
      const clampedMin = Math.max(min, Math.min(newMin, localValue[1] - step));
      const newValue: [number, number] = [clampedMin, localValue[1]];
      setLocalValue(newValue);
      onChange(newValue);
    },
    [localValue, min, step, onChange]
  );

  const handleMaxChange = useCallback(
    (newMax: number) => {
      const clampedMax = Math.min(max, Math.max(newMax, localValue[0] + step));
      const newValue: [number, number] = [localValue[0], clampedMax];
      setLocalValue(newValue);
      onChange(newValue);
    },
    [localValue, max, step, onChange]
  );

  const percentage = (val: number) => ((val - min) / (max - min)) * 100;

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="py-4">
      {/* Price inputs */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1">
          <label className="text-xs text-[var(--gray-500)] mb-1 block">Mínimo</label>
          <input
            type="number"
            value={localValue[0]}
            onChange={(e) => handleMinChange(Number(e.target.value))}
            className="w-full px-3 py-2 text-sm border border-[var(--gray-200)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-600)]/20 focus:border-[var(--primary-600)]"
            min={min}
            max={max}
            step={step}
          />
        </div>
        <span className="text-[var(--gray-400)] pt-5">—</span>
        <div className="flex-1">
          <label className="text-xs text-[var(--gray-500)] mb-1 block">Máximo</label>
          <input
            type="number"
            value={localValue[1]}
            onChange={(e) => handleMaxChange(Number(e.target.value))}
            className="w-full px-3 py-2 text-sm border border-[var(--gray-200)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-600)]/20 focus:border-[var(--primary-600)]"
            min={min}
            max={max}
            step={step}
          />
        </div>
      </div>

      {/* Dual range slider */}
      <div className="relative h-2 bg-[var(--gray-200)] rounded-full">
        {/* Track fill */}
        <div
          className="absolute h-full bg-[var(--primary-600)] rounded-full"
          style={{
            left: `${percentage(localValue[0])}%`,
            right: `${100 - percentage(localValue[1])}%`,
          }}
        />

        {/* Min thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[0]}
          onChange={(e) => handleMinChange(Number(e.target.value))}
          onMouseDown={() => setIsDragging("min")}
          onMouseUp={() => setIsDragging(null)}
          onTouchStart={() => setIsDragging("min")}
          onTouchEnd={() => setIsDragging(null)}
          className="absolute w-full h-full opacity-0 cursor-pointer z-20"
          style={{ pointerEvents: "none" }}
        />
        <div
          className={`absolute w-5 h-5 bg-white border-2 border-[var(--primary-600)] rounded-full shadow-md transform -translate-x-1/2 -translate-y-1/4 transition-transform ${
            isDragging === "min" ? "scale-110" : ""
          }`}
          style={{ left: `${percentage(localValue[0])}%` }}
        />

        {/* Max thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue[1]}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
          onMouseDown={() => setIsDragging("max")}
          onMouseUp={() => setIsDragging(null)}
          onTouchStart={() => setIsDragging("max")}
          onTouchEnd={() => setIsDragging(null)}
          className="absolute w-full h-full opacity-0 cursor-pointer z-20"
          style={{ pointerEvents: "none" }}
        />
        <div
          className={`absolute w-5 h-5 bg-white border-2 border-[var(--primary-600)] rounded-full shadow-md transform -translate-x-1/2 -translate-y-1/4 transition-transform ${
            isDragging === "max" ? "scale-110" : ""
          }`}
          style={{ left: `${percentage(localValue[1])}%` }}
        />
      </div>

      {/* Price labels */}
      <div className="flex justify-between mt-2 text-xs text-[var(--gray-500)]">
        <span>{formatPrice(min)}</span>
        <span>{formatPrice(max)}</span>
      </div>
    </div>
  );
}
