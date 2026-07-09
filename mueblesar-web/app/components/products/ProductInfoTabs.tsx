"use client";

import { useState, useEffect } from "react";

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

/* ---------- Color name → CSS color mapping (shared with ColorImageCarousel) ---------- */
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
  if (/^(#|rgb|hsl)/.test(lower)) return name;
  return "#d1d5db";
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
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

  // Listen for color changes from ColorImageCarousel via custom event
  const [displayColor, setDisplayColor] = useState<string | null>(color ?? null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ color: string }>).detail;
      if (detail?.color) setDisplayColor(detail.color);
    };
    window.addEventListener("color-swatch-change", handler);
    return () => window.removeEventListener("color-swatch-change", handler);
  }, []);

  // Update if the color prop changes server-side
  useEffect(() => {
    if (color) setDisplayColor(color);
  }, [color]);

  const colorCss = displayColor ? resolveColorCSS(displayColor) : null;

  return (
    <div className="mt-6">
      <div className="flex border-b">
        <button
          className={`px-4 py-2 -mb-px ${active === "description" ? "border-b-2 border-primary font-semibold" : "text-slate-600"
            }`}
          onClick={() => setActive("description")}
        >
          Descripción
        </button>
        <button
          className={`px-4 py-2 -mb-px ${active === "specs" ? "border-b-2 border-primary font-semibold" : "text-slate-600"
            }`}
          onClick={() => setActive("specs")}
        >
          Ficha técnica
        </button>
      </div>
      <div className="mt-4 text-sm text-slate-700">
        {active === "description" ? (
          <p>{description}</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {material && (
              <div>
                <div className="font-semibold text-slate-800">Material</div>
                <div>{material}</div>
              </div>
            )}
            {displayColor && (
              <div>
                <div className="font-semibold text-slate-800">Color</div>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-4 w-4 rounded-full border border-slate-200"
                    style={{ backgroundColor: colorCss ?? displayColor }}
                  />
                  <span>{capitalize(displayColor)}</span>
                </div>
              </div>
            )}
            {widthCm && (
              <div>
                <div className="font-semibold text-slate-800">Ancho</div>
                <div>{widthCm} cm</div>
              </div>
            )}
            {depthCm && (
              <div>
                <div className="font-semibold text-slate-800">Profundidad</div>
                <div>{depthCm} cm</div>
              </div>
            )}
            {heightCm && (
              <div>
                <div className="font-semibold text-slate-800">Altura</div>
                <div>{heightCm} cm</div>
              </div>
            )}
            {weightKg && (
              <div>
                <div className="font-semibold text-slate-800">Peso</div>
                <div>{weightKg} kg</div>
              </div>
            )}
            {category && (
              <div>
                <div className="font-semibold text-slate-800">Categoría</div>
                <div>{category}</div>
              </div>
            )}
            {room && (
              <div>
                <div className="font-semibold text-slate-800">Ambiente</div>
                <div>{room}</div>
              </div>
            )}
            {style && (
              <div>
                <div className="font-semibold text-slate-800">Estilo</div>
                <div>{style}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
