"use client";

import { useId, useState } from "react";
import { Home, Tag } from "lucide-react";

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

type ProductSpec = {
  label: string;
  value: string;
  color?: string;
};

const COLOR_CSS: Record<string, string> = {
  blanco: "#ffffff",
  negro: "#1a1a1a",
  gris: "#9ca3af",
  rojo: "#ef4444",
  azul: "#3b82f6",
  verde: "#22c55e",
  amarillo: "#eab308",
  naranja: "#f97316",
  rosa: "#ec4899",
  violeta: "#8b5cf6",
  morado: "#7c3aed",
  marrón: "#92400e",
  marron: "#92400e",
  beige: "#d4b896",
  crema: "#fdf5e6",
  celeste: "#7dd3fc",
  turquesa: "#2dd4bf",
  dorado: "#d4a017",
  plateado: "#c0c0c0",
  bordo: "#800020",
  coral: "#ff7f50",
  natural: "#c4a882",
  roble: "#b08d57",
  wengue: "#4a3728",
  nogal: "#5c3317",
  caoba: "#4d2b1a",
  white: "#ffffff",
  black: "#1a1a1a",
  gray: "#9ca3af",
  grey: "#9ca3af",
  red: "#ef4444",
  blue: "#3b82f6",
  green: "#22c55e",
  yellow: "#eab308",
  orange: "#f97316",
  pink: "#ec4899",
  purple: "#8b5cf6",
  brown: "#92400e",
};

function resolveColorCSS(name: string): string {
  const lower = name.toLowerCase().trim();
  if (COLOR_CSS[lower]) return COLOR_CSS[lower];

  for (const [key, value] of Object.entries(COLOR_CSS)) {
    if (lower.includes(key)) return value;
  }

  return "#d1d5db";
}

function textValue(value?: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed || null;
}

function measurement(value?: number | null): string | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? `${value} cm` : null;
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
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
  const tabId = useId();
  const specsTabId = `${tabId}-specs-tab`;
  const descriptionTabId = `${tabId}-description-tab`;
  const specsPanelId = `${tabId}-specs-panel`;
  const descriptionPanelId = `${tabId}-description-panel`;

  const colorValue = textValue(color);
  const dimensionEntries = [
    ["Ancho", measurement(widthCm)],
    ["Profundidad", measurement(depthCm)],
    ["Alto", measurement(heightCm)],
  ].filter((entry): entry is [string, string] => entry[1] !== null);
  const dimensions = dimensionEntries.length > 0
    ? dimensionEntries.map(([label, value]) => `${label}: ${value}`).join(" · ")
    : null;

  const specs = [
    textValue(material) && { label: "Material", value: textValue(material)! },
    colorValue && { label: "Color", value: capitalize(colorValue), color: colorValue },
    dimensions && { label: "Dimensiones", value: dimensions },
    measurement(weightKg) && { label: "Peso", value: measurement(weightKg)! },
    textValue(category) && { label: "Categoría", value: textValue(category)! },
    textValue(room) && { label: "Ambiente", value: textValue(room)! },
    textValue(style) && { label: "Estilo", value: textValue(style)! },
  ].filter((spec): spec is ProductSpec => Boolean(spec));

  const descriptionValue = textValue(description);

  return (
    <section className="overflow-hidden rounded-2xl border border-[#e2e8f0] bg-white shadow-sm" aria-label="Información del producto">
      <div className="flex border-b border-[#e2e8f0] bg-[#f8fafc]" role="tablist" aria-label="Información del producto">
        <button
          id={specsTabId}
          type="button"
          role="tab"
          aria-selected={activeTab === "specs"}
          aria-controls={specsPanelId}
          onClick={() => setActiveTab("specs")}
          className={`flex flex-1 items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#2563eb] ${
            activeTab === "specs"
              ? "border-b-2 border-[#2563eb] bg-white text-[#0f172a]"
              : "text-[#64748b] hover:text-[#0f172a]"
          }`}
        >
          <Tag className="h-4 w-4" aria-hidden="true" />
          Especificaciones técnicas
        </button>
        <button
          id={descriptionTabId}
          type="button"
          role="tab"
          aria-selected={activeTab === "description"}
          aria-controls={descriptionPanelId}
          onClick={() => setActiveTab("description")}
          className={`flex flex-1 items-center justify-center gap-2 px-6 py-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#2563eb] ${
            activeTab === "description"
              ? "border-b-2 border-[#2563eb] bg-white text-[#0f172a]"
              : "text-[#64748b] hover:text-[#0f172a]"
          }`}
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          Descripción
        </button>
      </div>

      <div className="p-6">
        {activeTab === "specs" ? (
          <div id={specsPanelId} role="tabpanel" aria-labelledby={specsTabId}>
            {specs.length > 0 ? (
              <dl className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {specs.map((spec) => (
                  <div key={spec.label} className="space-y-1">
                    <dt className="text-xs uppercase tracking-wider text-[#94a3b8]">{spec.label}</dt>
                    <dd className="flex items-center gap-2 text-sm font-semibold text-[#0f172a]">
                      {spec.color && (
                        <span
                          className="inline-block h-4 w-4 rounded-full border border-[#cbd5e1]"
                          style={{ backgroundColor: resolveColorCSS(spec.color) }}
                          aria-hidden="true"
                        />
                      )}
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-[#64748b]" role="status">
                La tienda no informó especificaciones. A confirmar con la tienda.
              </p>
            )}
          </div>
        ) : (
          <div id={descriptionPanelId} role="tabpanel" aria-labelledby={descriptionTabId} className="prose prose-sm max-w-none text-[#475569]">
            {descriptionValue ? (
              <p>{descriptionValue}</p>
            ) : (
              <p role="status">La tienda no informó una descripción. A confirmar con la tienda.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
