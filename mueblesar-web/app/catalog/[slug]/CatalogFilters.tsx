"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";

interface CatalogFiltersProps {
  slug: string;
  categories: { value: string; label: string }[];
  rooms: { value: string; label: string }[];
  currentCategory?: string;
  currentRoom?: string;
  currentSort?: string;
  currentDirection?: string;
}

const SORT_OPTIONS = [
  { value: "createdAt", label: "Más recientes", direction: "desc" },
  { value: "price", label: "Precio: menor a mayor", direction: "asc" },
  { value: "price", label: "Precio: mayor a menor", direction: "desc" },
  { value: "name", label: "Nombre: A-Z", direction: "asc" },
  { value: "name", label: "Nombre: Z-A", direction: "desc" },
];

export function CatalogFilters({
  slug,
  categories,
  rooms,
  currentCategory,
  currentRoom,
  currentSort = "createdAt",
  currentDirection = "desc",
}: CatalogFiltersProps) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const buildQueryString = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    // Reset page when filters change
    params.delete("page");
    const query = params.toString();
    return query ? `?${query}` : "";
  };

  const currentSortLabel = SORT_OPTIONS.find(
    (opt) => opt.value === currentSort && opt.direction === currentDirection
  )?.label || "Ordenar por";

  const activeFiltersCount =
    (currentCategory ? 1 : 0) + (currentRoom ? 1 : 0);

  return (
    <>
      {/* Desktop & Mobile Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        {/* Category Pills - Desktop */}
        <div className="hidden md:flex flex-wrap gap-2">
          <Link
            href={`/catalog/${slug}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !currentCategory
                ? "bg-[var(--primary-600)] text-white"
                : "bg-white border border-[var(--gray-200)] text-[var(--gray-700)] hover:bg-[var(--gray-50)]"
            }`}
          >
            Todas
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.value}
              href={`/catalog/${slug}${buildQueryString({ category: cat.value })}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                currentCategory === cat.value
                  ? "bg-[var(--primary-600)] text-white"
                  : "bg-white border border-[var(--gray-200)] text-[var(--gray-700)] hover:bg-[var(--gray-50)]"
              }`}
            >
              {cat.label}
            </Link>
          ))}
        </div>

        {/* Mobile Filter Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors ${
              showMobileFilters || activeFiltersCount > 0
                ? "bg-[var(--primary-600)] text-white"
                : "bg-white border border-[var(--gray-200)] text-[var(--gray-700)]"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-white text-[var(--primary-600)]">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Sort Dropdown */}
        <div className="relative group">
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[var(--gray-200)] rounded-xl text-sm font-medium text-[var(--gray-700)] hover:border-[var(--gray-300)] transition-colors"
          >
            <span className="hidden sm:inline">{currentSortLabel}</span>
            <span className="sm:hidden">Ordenar</span>
            <ChevronDown className="w-4 h-4 text-[var(--gray-400)]" />
          </button>
          
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-[var(--gray-200)] shadow-lg z-50 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            {SORT_OPTIONS.map((option) => (
              <Link
                key={`${option.value}-${option.direction}`}
                href={`/catalog/${slug}${buildQueryString({
                  sort: option.value,
                  direction: option.direction,
                })}`}
                className={`block w-full px-4 py-2.5 text-sm text-left transition-colors hover:bg-[var(--gray-50)] ${
                  currentSort === option.value && currentDirection === option.direction
                    ? "bg-[var(--primary-50)] text-[var(--primary-600)] font-medium"
                    : "text-[var(--gray-700)]"
                }`}
              >
                {option.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Filters Panel */}
      {showMobileFilters && (
        <div className="md:hidden bg-white rounded-xl border border-[var(--gray-200)] p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--gray-900)]">Filtros</h3>
            <button
              type="button"
              onClick={() => setShowMobileFilters(false)}
              className="p-1 hover:bg-[var(--gray-100)] rounded-lg"
            >
              <X className="w-5 h-5 text-[var(--gray-500)]" />
            </button>
          </div>

          {/* Mobile Categories */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-[var(--gray-700)] mb-2">Categoría</h4>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/catalog/${slug}`}
                onClick={() => setShowMobileFilters(false)}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  !currentCategory
                    ? "bg-[var(--primary-600)] text-white"
                    : "bg-[var(--gray-100)] text-[var(--gray-700)]"
                }`}
              >
                Todas
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.value}
                  href={`/catalog/${slug}${buildQueryString({ category: cat.value })}`}
                  onClick={() => setShowMobileFilters(false)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    currentCategory === cat.value
                      ? "bg-[var(--primary-600)] text-white"
                      : "bg-[var(--gray-100)] text-[var(--gray-700)]"
                  }`}
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Rooms */}
          <div>
            <h4 className="text-sm font-medium text-[var(--gray-700)] mb-2">Ambiente</h4>
            <div className="flex flex-wrap gap-2">
              {rooms.map((room) => (
                <Link
                  key={room.value}
                  href={`/catalog/${slug}${buildQueryString({
                    room: currentRoom === room.value ? undefined : room.value,
                  })}`}
                  onClick={() => setShowMobileFilters(false)}
                  className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                    currentRoom === room.value
                      ? "bg-[var(--primary-600)] text-white"
                      : "bg-[var(--gray-100)] text-[var(--gray-700)]"
                  }`}
                >
                  {room.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {(currentCategory || currentRoom) && (
            <Link
              href={`/catalog/${slug}`}
              onClick={() => setShowMobileFilters(false)}
              className="mt-4 block w-full text-center py-2 text-sm font-medium text-[var(--primary-600)] hover:text-[var(--primary-700)]"
            >
              Limpiar filtros
            </Link>
          )}
        </div>
      )}

      {/* Active Filter Chips */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {currentCategory && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-[var(--primary-50)] text-[var(--primary-700)] text-sm rounded-full">
              {categories.find((c) => c.value === currentCategory)?.label || currentCategory}
              <Link
                href={`/catalog/${slug}${buildQueryString({ category: undefined })}`}
                className="hover:text-[var(--primary-900)]"
              >
                <X className="w-3.5 h-3.5" />
              </Link>
            </span>
          )}
          {currentRoom && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-[var(--primary-50)] text-[var(--primary-700)] text-sm rounded-full">
              {rooms.find((r) => r.value === currentRoom)?.label || currentRoom}
              <Link
                href={`/catalog/${slug}${buildQueryString({ room: undefined })}`}
                className="hover:text-[var(--primary-900)]"
              >
                <X className="w-3.5 h-3.5" />
              </Link>
            </span>
          )}
          <Link
            href={`/catalog/${slug}`}
            className="text-sm text-[var(--gray-500)] hover:text-[var(--gray-700)] ml-2"
          >
            Limpiar todo
          </Link>
        </div>
      )}
    </>
  );
}
