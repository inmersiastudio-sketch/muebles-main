"use client";

import { useMemo, useState } from "react";
import { Cuboid, ImageIcon, Rotate3D } from "lucide-react";
import { FurnitureARViewer } from "../products/FurnitureARViewer";
import { ImageWithFallback } from "../ui/ImageWithFallback";

const HERO_IMAGE = "/images/landing-hero.png";

type Props = {
  glbUrl?: string | null;
  imageUrl?: string | null;
};

function resolveNetworkUrl(url: string): string {
  if (typeof window !== "undefined" && !["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    return url
      .replace(/localhost:3001/g, `${window.location.hostname}:3001`)
      .replace(/127\.0\.0\.1:3001/g, `${window.location.hostname}:3001`);
  }
  return url;
}

function getFallbackModelUrl(): string {
  const configuredBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
  return resolveNetworkUrl(`${configuredBase.replace(/\/$/, "")}/api/ar/demo/pilot-sofa.glb`);
}

/** Vista de bienvenida: modelo 3D manipulable o imagen del ambiente. */
export function HeroProductPreview({ glbUrl, imageUrl }: Props) {
  const [mode, setMode] = useState<"3d" | "image">("3d");
  const modelUrl = useMemo(() => resolveNetworkUrl(glbUrl || getFallbackModelUrl()), [glbUrl]);
  const heroImage = imageUrl || HERO_IMAGE;

  return (
    <div className="relative w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[450px]">
      <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#eef2ef] shadow-2xl shadow-black/35">
        <div className="flex items-center justify-between border-b border-black/10 bg-white/95 px-3 py-2 backdrop-blur-sm">
          <div className="inline-flex rounded-lg bg-[#edf1ee] p-0.5">
            <button
              type="button"
              onClick={() => setMode("3d")}
              aria-pressed={mode === "3d"}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-bold transition-colors ${mode === "3d" ? "bg-white text-[#0b6e5e] shadow-sm" : "text-[#61706a] hover:text-[#1c2421]"}`}
            >
              <Cuboid className="h-3.5 w-3.5" />
              3D
            </button>
            <button
              type="button"
              onClick={() => setMode("image")}
              aria-pressed={mode === "image"}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-bold transition-colors ${mode === "image" ? "bg-white text-[#1c2421] shadow-sm" : "text-[#61706a] hover:text-[#1c2421]"}`}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              Imagen
            </button>
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-[#61706a]">
            <Rotate3D className="h-3.5 w-3.5" />
            {mode === "3d" ? "Arrastrá" : "Vista ambiente"}
          </span>
        </div>

        <div className="h-[300px] sm:h-[350px] lg:h-[390px]">
          {mode === "3d" ? (
            <FurnitureARViewer
              src={modelUrl}
              alt="Sofá Nativo Bouclé, modelo 3D interactivo"
              showPackageBox={false}
              className="!min-h-0 rounded-none border-0"
            />
          ) : (
            <ImageWithFallback
              src={heroImage}
              alt="Sillón contemporáneo de la colección destacada"
              loading="eager"
              className="h-full w-full object-cover"
            />
          )}
        </div>
      </div>

      {mode === "3d" && (
        <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-white/95 px-3.5 py-2 shadow-lg backdrop-blur-sm">
          <span className="flex h-2 w-2 animate-pulse rounded-full bg-[#0b6e5e]" />
          <p className="text-xs font-semibold text-[#1c2421]">Modelo 3D interactivo</p>
        </div>
      )}
    </div>
  );
}
