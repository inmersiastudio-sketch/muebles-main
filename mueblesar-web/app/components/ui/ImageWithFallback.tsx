"use client";

import { useState } from "react";

type ImageWithFallbackProps = {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  loading?: "eager" | "lazy";
};

const DEFAULT_FALLBACK = "/images/examples/sofa-boucle-roble-ai.png";

/** Muestra un recurso local cuando una URL de media externa no está disponible. */
export function ImageWithFallback({
  src,
  alt,
  className,
  fallbackSrc = DEFAULT_FALLBACK,
  loading = "lazy",
}: ImageWithFallbackProps) {
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading={loading}
      decoding="async"
      className={className}
      onError={() => {
        if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc);
      }}
    />
  );
}
