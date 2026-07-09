"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Package, ExternalLink, Instagram } from "lucide-react";
import type { Store } from "@/types";

interface StoreCardProps {
  store: Store;
  variant?: "default" | "compact" | "featured";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getLocationLabel(store: Store): string | null {
  const parts = [store.city, store.province].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}

export function StoreCard({ store, variant = "default" }: StoreCardProps) {
  const location = getLocationLabel(store);
  const productCount = store._count?.products ?? 0;

  if (variant === "compact") {
    return (
      <Link
        href={`/catalog/${store.slug}`}
        className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-slate-300 hover:shadow-sm"
      >
        {/* Logo */}
        <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
          {store.logoUrl ? (
            <Image
              src={store.logoUrl}
              alt={store.name}
              fill
              className="object-cover"
              sizes="56px"
            />
          ) : (
            <span className="text-sm font-bold text-slate-500">
              {getInitials(store.name)}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-slate-900 group-hover:text-slate-700">
            {store.name}
          </h3>
          {location && (
            <p className="flex items-center gap-1 text-xs text-slate-500">
              <MapPin size={12} />
              <span className="truncate">{location}</span>
            </p>
          )}
        </div>

        <ExternalLink size={16} className="flex-shrink-0 text-slate-400" />
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link
        href={`/catalog/${store.slug}`}
        className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-slate-300 hover:shadow-lg"
      >
        {/* Header con logo grande */}
        <div className="relative h-32 bg-gradient-to-br from-slate-50 to-slate-100 p-6">
          <div className="absolute inset-0 opacity-50" />
          <div className="relative flex h-full items-end">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border-2 border-white bg-white shadow-md">
              {store.logoUrl ? (
                <Image
                  src={store.logoUrl}
                  alt={store.name}
                  width={80}
                  height={80}
                  className="object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-slate-400">
                  {getInitials(store.name)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-slate-700">
            {store.name}
          </h3>

          {store.description && (
            <p className="mt-2 line-clamp-2 text-sm text-slate-600">
              {store.description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            {location && (
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Package size={12} />
              {productCount} producto{productCount !== 1 ? "s" : ""}
            </span>
          </div>

          {/* CTA */}
          <div className="mt-auto pt-4">
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-900 group-hover:text-slate-700">
              Ver catálogo
              <ExternalLink size={14} />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link
      href={`/catalog/${store.slug}`}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex items-start gap-4">
        {/* Logo */}
        <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
          {store.logoUrl ? (
            <Image
              src={store.logoUrl}
              alt={store.name}
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <span className="text-lg font-bold text-slate-500">
              {getInitials(store.name)}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900 group-hover:text-slate-700">
            {store.name}
          </h3>

          {store.description && (
            <p className="mt-1 line-clamp-2 text-sm text-slate-600">
              {store.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            {location && (
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Package size={12} />
              {productCount} producto{productCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Footer con acciones */}
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
          Explorar tienda →
        </span>
        {store.socialInstagram && (
          <span
            className="text-slate-400 hover:text-pink-600"
            onClick={(e) => e.stopPropagation()}
          >
            <Instagram size={18} />
          </span>
        )}
      </div>
    </Link>
  );
}
