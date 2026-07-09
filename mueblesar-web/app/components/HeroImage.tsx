"use client";

interface HeroImageProps {
  src: string;
  alt: string;
  fallbackSrc: string;
  className?: string;
}

export function HeroImage({ src, alt, fallbackSrc, className = "" }: HeroImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={`h-auto w-full object-contain drop-shadow-2xl ${className}`}
      onError={(e) => {
        e.currentTarget.src = fallbackSrc;
      }}
    />
  );
}
