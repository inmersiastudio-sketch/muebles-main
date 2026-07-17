"use client";

import { Package } from "lucide-react";
import { ARPreview } from "./ARPreview";

type PackageARPreviewProps = {
  productId: number;
  storeId?: number | null;
  productName: string;
  widthCm: number;
  heightCm: number;
  depthCm: number;
  weightKg?: number | null;
  piecesCount?: number;
};

export function PackageARPreview({
  productId,
  storeId,
  productName,
  widthCm,
  heightCm,
  depthCm,
  weightKg,
  piecesCount = 1,
}: PackageARPreviewProps) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
  const glbUrl = `${apiBase}/api/ar/package/${productId}`;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
          <Package className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-amber-950">Comprobá el acceso del embalaje</h3>
          <p className="mt-1 text-xs leading-relaxed text-amber-900/80">
            Caja de {widthCm} × {depthCm} × {heightCm} cm
            {weightKg ? ` · ${weightKg} kg` : ""}
            {piecesCount > 1 ? ` · ${piecesCount} bultos iguales` : ""}.
          </p>
        </div>
      </div>

      <ARPreview
        glbUrl={glbUrl}
        productId={productId}
        storeId={storeId}
        productName={`Embalaje de ${productName}`}
        widthCm={widthCm}
        heightCm={heightCm}
        depthCm={depthCm}
        isVerified
        buttonLabel="Comprobar embalaje en AR"
        useProductShortLink={false}
      />
      <p className="mt-2 text-[11px] leading-relaxed text-amber-900/70">
        Esta vista ayuda a estimar el paso por puertas, ventanas o ascensores. Considerá también marcos, curvas y espacio para girar la caja.
      </p>
    </div>
  );
}
