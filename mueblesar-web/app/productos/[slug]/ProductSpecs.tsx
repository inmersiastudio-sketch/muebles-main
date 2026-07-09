"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Ruler, Box, Palette, Home, Tag, Layers } from "lucide-react";

interface ProductSpecsProps {
  description?: string | null;
  category?: string | null;
  room?: string | null;
  style?: string | null;
  material?: string | null;
  color?: string | null;
  widthCm?: number | null;
  depthCm?: number | null;
  heightCm?: number | null;
  weightKg?: number | null;
}

const COLOR_CSS: Record<string, string> = {
  "blanco": "#ffffff", "negro": "#1a1a1a", "gris": "#9ca3af", "rojo": "#ef4444",
  "azul": "#3b82f6", "verde": "#22c55e", "amarillo": "#eab308", "naranja": "#f97316",
  "rosa": "#ec4899", "violeta": "#8b5cf6", "morado": "#7c3aed", "marrón": "#92400e",
  "marron": "#92400e", "beige": "#d4b896", "crema": "#fdf5e6", "celeste": "#7dd3fc",
  "turquesa": "#2dd4bf", "dorado": "#d4a017", "plateado": "#c0c0c0", "bordo": "#800020",
  "coral": "#ff7f50", "natural": "#c4a882", "roble": "#b08d57", "wengue": "#4a3728",
  "nogal": "#5c3317", "caoba": "#4d2b1a", "white": "#ffffff", "black": "#1a1a1a",
  "gray": "#9ca3af", "grey": "#9ca3af", "red": "#ef4444", "blue": "#3b82f6",
  "green": "#22c55e", "yellow": "#eab308", "orange": "#f97316", "pink": "#ec4899",
  "purple": "#8b5cf6", "brown": "#92400e",
};

function resolveColorCSS(name: string): string {
  const lower = name.toLowerCase().trim();
  if (COLOR_CSS[lower]) return COLOR_CSS[lower];
  for (const [key, value] of Object.entries(COLOR_CSS)) {
    if (lower.includes(key)) return value;
  }
  return "#d1d5db";
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function ProductSpecs({
  description,
  category,
  room,
  style,
  material,
  color,
  widthCm,
  depthCm,
  heightCm,
  weightKg,
}: ProductSpecsProps) {
  const [activeTab, setActiveTab] = useState<"specs" | "description">("specs");

  const specs = [
    { label: "Estructura", value: material || "Madera de Saligua Maciza", icon: Layers },
    { label: "Tapizado", value: "Lino Anti-manchas", icon: Box },
    { label: "Patas", value: "Paraíso Lustrado", icon: Ruler },
    { label: "Dimensiones", value: widthCm && depthCm && heightCm ? `${widthCm}cm x ${depthCm}cm x ${heightCm}cm` : "210cm x 90cm x 85cm", icon: Ruler },
    { label: "Relleno", value: "Placa Soft 28kg", icon: Box },
    { label: "Color", value: color ? capitalize(color) : "Gris Perla", icon: Palette },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-sm">
      {/* Tabs */}
      <div className="flex border-b border-[#e2e8f0] bg-[#f8fafc]">
        <button
          onClick={() => setActiveTab("specs")}
          className={`flex flex-1 items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-colors ${
            activeTab === "specs"
              ? "border-b-2 border-[#2563eb] bg-white text-[#0f172a]"
              : "text-[#64748b] hover:text-[#0f172a]"
          }`}
        >
          <Tag className="w-4 h-4" />
          Especificaciones Técnicas
        </button>
        <button
          onClick={() => setActiveTab("description")}
          className={`flex flex-1 items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-colors ${
            activeTab === "description"
              ? "border-b-2 border-[#2563eb] bg-white text-[#0f172a]"
              : "text-[#64748b] hover:text-[#0f172a]"
          }`}
        >
          <Home className="w-4 h-4" />
          Descripción
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === "specs" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {specs.map((spec, index) => (
              <div key={index} className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-[#94a3b8]">{spec.label}</p>
                <p className="flex items-center gap-2 text-sm font-semibold text-[#0f172a]">
                  {spec.label === "Color" && color ? (
                    <>
                      <span
                        className="inline-block h-4 w-4 rounded-full border border-[#cbd5e1]"
                        style={{ backgroundColor: resolveColorCSS(color) }}
                      />
                      {spec.value}
                    </>
                  ) : (
                    spec.value
                  )}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="prose prose-sm max-w-none text-[#475569]">
            <p>{description || "Diseño nórdico, máximo confort. Tapizado en lino anti-manchas con estructura de madera maciza. Ideal para living y espacios modernos."}</p>
          </div>
        )}
      </div>
    </div>
  );
}
