"use client";

import dynamic from "next/dynamic";

export const FurnitureARViewer = dynamic(
  () => import("./FurnitureARViewer.client").then((mod) => mod.FurnitureARViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[320px] items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-500">
        Cargando modelo 3D...
      </div>
    ),
  }
);
