"use client";

import Link from "next/link";
import { 
  Search, 
  Package, 
  ShoppingBag, 
  Heart, 
  Store, 
  Box,
  ArrowRight,
  Sparkles
} from "lucide-react";

interface EmptyStateProps {
  icon?: "search" | "product" | "cart" | "favorites" | "store" | "box" | "sparkles";
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  variant?: "default" | "compact" | "card";
}

const iconMap = {
  search: Search,
  product: Package,
  cart: ShoppingBag,
  favorites: Heart,
  store: Store,
  box: Box,
  sparkles: Sparkles,
};

export function EmptyState({
  icon = "box",
  title,
  description,
  actionLabel,
  actionHref,
  secondaryActionLabel,
  secondaryActionHref,
  variant = "default",
}: EmptyStateProps) {
  const Icon = iconMap[icon];

  if (variant === "compact") {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--gray-100)] mb-3">
          <Icon className="h-5 w-5 text-[var(--gray-400)]" />
        </div>
        <h3 className="text-sm font-semibold text-[var(--gray-900)]">{title}</h3>
        {description && (
          <p className="mt-1 text-xs text-[var(--gray-500)] max-w-xs">{description}</p>
        )}
        {actionLabel && actionHref && (
          <Link
            href={actionHref}
            className="mt-3 inline-flex items-center text-xs font-medium text-[var(--primary-600)] hover:text-[var(--primary-700)]"
          >
            {actionLabel}
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        )}
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className="rounded-xl border border-dashed border-[var(--gray-300)] bg-white p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--primary-50)] mx-auto mb-4">
          <Icon className="h-6 w-6 text-[var(--primary-600)]" />
        </div>
        <h3 className="text-base font-semibold text-[var(--gray-900)]">{title}</h3>
        {description && (
          <p className="mt-1.5 text-sm text-[var(--gray-500)] max-w-sm mx-auto">{description}</p>
        )}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
          {actionLabel && actionHref && (
            <Link
              href={actionHref}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[var(--primary-600)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-700)]"
            >
              {actionLabel}
            </Link>
          )}
          {secondaryActionLabel && secondaryActionHref && (
            <Link
              href={secondaryActionHref}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--gray-200)] bg-white px-4 py-2 text-sm font-medium text-[var(--gray-700)] transition-colors hover:bg-[var(--gray-50)]"
            >
              {secondaryActionLabel}
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--primary-50)] mb-5">
        <Icon className="h-10 w-10 text-[var(--primary-600)]" />
      </div>
      <h3 className="text-xl font-bold text-[var(--gray-900)]">{title}</h3>
      {description && (
        <p className="mt-2 text-base text-[var(--gray-500)] max-w-md">{description}</p>
      )}
      <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
        {actionLabel && actionHref && (
          <Link
            href={actionHref}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--primary-600)] px-6 py-3 text-base font-semibold text-white shadow-lg shadow-[var(--primary-600)]/20 transition-all hover:bg-[var(--primary-700)] active:scale-95"
          >
            {actionLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
        {secondaryActionLabel && secondaryActionHref && (
          <Link
            href={secondaryActionHref}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--gray-200)] bg-white px-6 py-3 text-base font-semibold text-[var(--gray-700)] transition-colors hover:bg-[var(--gray-50)]"
          >
            {secondaryActionLabel}
          </Link>
        )}
      </div>
    </div>
  );
}

// Preset empty states for common use cases
export function EmptyProducts() {
  return (
    <EmptyState
      icon="product"
      title="No hay productos disponibles"
      description="Esta tienda aún no ha publicado productos en su catálogo. Vuelve a consultar más tarde."
      actionLabel="Ver otras mueblerías"
      actionHref="/mueblerias"
      variant="default"
    />
  );
}

export function EmptySearch({ query }: { query?: string }) {
  return (
    <EmptyState
      icon="search"
      title={query ? `No encontramos resultados para "${query}"` : "No encontramos resultados"}
      description="Intentá con otros términos de búsqueda o navegá por nuestras categorías."
      actionLabel="Ver catálogo completo"
      actionHref="/productos"
      secondaryActionLabel="Ver mueblerías"
      secondaryActionHref="/mueblerias"
      variant="default"
    />
  );
}

export function EmptyCart() {
  return (
    <EmptyState
      icon="cart"
      title="Tu carrito está vacío"
      description="Agregá productos de nuestras mueblerías para comenzar tu compra."
      actionLabel="Explorar productos"
      actionHref="/productos"
      variant="default"
    />
  );
}

export function EmptyFavorites() {
  return (
    <EmptyState
      icon="favorites"
      title="No tenés favoritos guardados"
      description="Agregá productos a tus favoritos para encontrarlos rápidamente después."
      actionLabel="Ver catálogo"
      actionHref="/productos"
      variant="default"
    />
  );
}

export function EmptyStores() {
  return (
    <EmptyState
      icon="store"
      title="No hay mueblerías registradas"
      description="Pronto podrás ver los comercios adheridos a la plataforma."
      actionLabel="Contactanos"
      actionHref="/contacto"
      variant="default"
    />
  );
}

export function NoResultsWithFilters({ onClear }: { onClear?: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--gray-300)] bg-white p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--gray-100)] mx-auto mb-4">
        <Search className="h-7 w-7 text-[var(--gray-400)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--gray-900)]">
        No se encontraron productos
      </h3>
      <p className="mt-2 text-sm text-[var(--gray-500)] max-w-sm mx-auto">
        No hay productos que coincidan con los filtros aplicados. Probá ajustando tus criterios de búsqueda.
      </p>
      {onClear && (
        <button
          onClick={onClear}
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary-600)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-700)]"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
