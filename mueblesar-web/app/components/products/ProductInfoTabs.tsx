"use client";

import { useEffect, useId, useState } from "react";

export type ProductInfo = {
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
};

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

  return /^(#|rgb|hsl)/.test(lower) ? name : "#d1d5db";
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

export function ProductInfoTabs({
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
}: ProductInfo) {
  const [active, setActive] = useState<"description" | "specs">("description");
  const [displayColor, setDisplayColor] = useState<string | null>(textValue(color));
  const tabId = useId();
  const descriptionTabId = `${tabId}-description-tab`;
  const specsTabId = `${tabId}-specs-tab`;
  const descriptionPanelId = `${tabId}-description-panel`;
  const specsPanelId = `${tabId}-specs-panel`;

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ color?: string }>).detail;
      const nextColor = textValue(detail?.color);
      if (nextColor) setDisplayColor(nextColor);
    };

    window.addEventListener("color-swatch-change", handler);
    return () => window.removeEventListener("color-swatch-change", handler);
  }, []);

  useEffect(() => {
    setDisplayColor(textValue(color));
  }, [color]);

  const colorCss = displayColor ? resolveColorCSS(displayColor) : null;
  const specs = [
    textValue(material) && { label: "Material", value: textValue(material)! },
    displayColor && { label: "Color", value: capitalize(displayColor), color: displayColor },
    measurement(widthCm) && { label: "Ancho", value: measurement(widthCm)! },
    measurement(depthCm) && { label: "Profundidad", value: measurement(depthCm)! },
    measurement(heightCm) && { label: "Altura", value: measurement(heightCm)! },
    measurement(weightKg) && { label: "Peso", value: `${weightKg} kg` },
    textValue(category) && { label: "Categoría", value: textValue(category)! },
    textValue(room) && { label: "Ambiente", value: textValue(room)! },
    textValue(style) && { label: "Estilo", value: textValue(style)! },
  ].filter((spec): spec is ProductSpec => Boolean(spec));
  const descriptionValue = textValue(description);

  return (
    <div className="mt-6">
      <div className="flex border-b" role="tablist" aria-label="Detalles del producto">
        <button
          id={descriptionTabId}
          type="button"
          role="tab"
          aria-selected={active === "description"}
          aria-controls={descriptionPanelId}
          className={`-mb-px px-4 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary ${
            active === "description" ? "border-b-2 border-primary font-semibold" : "text-slate-600"
          }`}
          onClick={() => setActive("description")}
        >
          Descripción
        </button>
        <button
          id={specsTabId}
          type="button"
          role="tab"
          aria-selected={active === "specs"}
          aria-controls={specsPanelId}
          className={`-mb-px px-4 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary ${
            active === "specs" ? "border-b-2 border-primary font-semibold" : "text-slate-600"
          }`}
          onClick={() => setActive("specs")}
        >
          Ficha técnica
        </button>
      </div>
      <div className="mt-4 text-sm text-slate-700">
        {active === "description" ? (
          <div id={descriptionPanelId} role="tabpanel" aria-labelledby={descriptionTabId}>
            {descriptionValue ? (
              <p>{descriptionValue}</p>
            ) : (
              <p className="text-slate-500" role="status">
                La tienda no informó una descripción. A confirmar con la tienda.
              </p>
            )}
          </div>
        ) : (
          <div id={specsPanelId} role="tabpanel" aria-labelledby={specsTabId}>
            {specs.length > 0 ? (
              <dl className="grid grid-cols-2 gap-3">
                {specs.map((spec) => (
                  <div key={spec.label}>
                    <dt className="font-semibold text-slate-800">{spec.label}</dt>
                    <dd className="mt-0.5 flex items-center gap-2">
                      {spec.color && (
                        <span
                          className="inline-block h-4 w-4 rounded-full border border-slate-200"
                          style={{ backgroundColor: colorCss ?? spec.color }}
                          aria-hidden="true"
                        />
                      )}
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-slate-500" role="status">
                La tienda no informó especificaciones. A confirmar con la tienda.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
