"use client";

import { useState, useMemo } from "react";
import { ImageCarousel } from "./ImageCarousel";

export type ImageWithType = {
  url: string;
  type?: string | null; // we will interpret type as color name
};

type Props = {
  images: ImageWithType[];
  alt: string;
  initialColor?: string | null;
  fallbackColor?: string | null;
  arUrl?: string;
  glbUrl?: string;
  usdzUrl?: string;
  onColorChange?: (color: string) => void;
};

/* ---------- Color name → CSS color mapping ---------- */
const COLOR_MAP: Record<string, string> = {
  // Spanish color names
  "blanco": "#ffffff",
  "negro": "#1a1a1a",
  "gris": "#9ca3af",
  "rojo": "#ef4444",
  "azul": "#3b82f6",
  "verde": "#22c55e",
  "amarillo": "#eab308",
  "naranja": "#f97316",
  "rosa": "#ec4899",
  "violeta": "#8b5cf6",
  "morado": "#7c3aed",
  "marrón": "#92400e",
  "marron": "#92400e",
  "beige": "#d4b896",
  "crema": "#fdf5e6",
  "celeste": "#7dd3fc",
  "turquesa": "#2dd4bf",
  "dorado": "#d4a017",
  "plateado": "#c0c0c0",
  "bordo": "#800020",
  "coral": "#ff7f50",
  "natural": "#c4a882",
  "roble": "#b08d57",
  "wengue": "#4a3728",
  "nogal": "#5c3317",
  "caoba": "#4d2b1a",
  // English color names
  "white": "#ffffff",
  "black": "#1a1a1a",
  "gray": "#9ca3af",
  "grey": "#9ca3af",
  "red": "#ef4444",
  "blue": "#3b82f6",
  "green": "#22c55e",
  "yellow": "#eab308",
  "orange": "#f97316",
  "pink": "#ec4899",
  "purple": "#8b5cf6",
  "brown": "#92400e",
};

/** Try to resolve a color name to a CSS color value */
function resolveColor(name: string): string {
  const lower = name.toLowerCase().trim();

  // Direct match
  if (COLOR_MAP[lower]) return COLOR_MAP[lower];

  // Partial match — check if the name contains a known color word
  for (const [key, value] of Object.entries(COLOR_MAP)) {
    if (lower.includes(key)) return value;
  }

  // If it already looks like a CSS color (#hex, rgb, hsl), use it
  if (/^(#|rgb|hsl)/.test(lower)) {
    return name;
  }
  
  // Check CSS.supports only on client side
  if (typeof window !== "undefined" && CSS.supports?.("color", lower)) {
    return name;
  }

  // Fallback — a neutral swatch
  return "#d1d5db";
}

/** Get a readable label from the type string */
function getColorLabel(name: string): string {
  // Capitalize first letter
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function ColorImageCarousel({ images, alt, initialColor, fallbackColor, arUrl, glbUrl, usdzUrl, onColorChange }: Props) {
  // group images by type/color; untyped images go into "__default" group
  const groups = useMemo(() => {
    const map = new Map<string, string[]>();
    images.forEach((img) => {
      const key = img.type && img.type.trim() !== "" ? img.type.trim() : "__default";
      const arr = map.get(key) || [];
      arr.push(img.url);
      map.set(key, arr);
    });
    return map;
  }, [images]);

  const availableColors = useMemo(() => {
    const cols: string[] = [];
    groups.forEach((_urls, key) => {
      if (key !== "__default") cols.push(key);
    });
    return cols;
  }, [groups]);

  // Auto-select first color if no initial/fallback provided
  const defaultColor = initialColor && availableColors.includes(initialColor)
    ? initialColor
    : fallbackColor && availableColors.includes(fallbackColor)
      ? fallbackColor
      : availableColors.length > 0
        ? availableColors[0]
        : null;
  const [selectedColor, setSelectedColor] = useState<string | null>(defaultColor);

  const carouselImages = useMemo(() => {
    if (selectedColor && groups.has(selectedColor)) {
      return groups.get(selectedColor)!;
    }
    // if no color selected or group missing, show all images
    return images.map((i) => i.url);
  }, [selectedColor, groups, images]);

  return (
    <div className="flex h-full flex-col">
      {availableColors.length > 0 && (
        <div className="mb-2.5 flex items-center gap-2.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Color:</span>
          <div className="flex items-center gap-2">
            {availableColors.map((col) => {
              const cssColor = resolveColor(col);
              const isSelected = selectedColor === col;
              const isLight = ["#ffffff", "#fdf5e6", "#d4b896"].includes(cssColor) || cssColor === "#ffffff";
              return (
                <button
                  key={col}
                  type="button"
                  title={getColorLabel(col)}
                  onClick={() => {
                    setSelectedColor(col);
                    onColorChange?.(col);
                    window.dispatchEvent(new CustomEvent("color-swatch-change", { detail: { color: col } }));
                  }}
                  className={`
                    relative h-7 w-7 rounded-full transition-all duration-200
                    ${isSelected
                      ? "ring-2 ring-offset-2 ring-[#0058a3] scale-110"
                      : "hover:scale-110 hover:ring-2 hover:ring-offset-1 hover:ring-slate-300"
                    }
                    ${isLight ? "border border-slate-200" : ""}
                  `}
                  style={{ backgroundColor: cssColor }}
                >
                  {isSelected && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={isLight ? "#1a1a1a" : "#ffffff"}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {selectedColor && (
            <span className="text-sm font-medium text-slate-600">
              {getColorLabel(selectedColor)}
            </span>
          )}
        </div>
      )}
      <div className="min-h-0 flex-1">
        <ImageCarousel images={carouselImages} alt={alt} arUrl={arUrl} glbUrl={glbUrl} usdzUrl={usdzUrl} hideThumbnails={availableColors.length > 0} />
      </div>
    </div>
  );
}
