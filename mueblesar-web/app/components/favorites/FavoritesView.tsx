"use client";

import Link from "next/link";
import { FavoriteItem, useFavorites } from "../../lib/favorites";
import { ProductCard } from "../products/ProductCard";
import { EmptyFavorites } from "../ui/EmptyState";

export function FavoritesView() {
  const { items } = useFavorites();

  if (!items.length) {
    return <EmptyFavorites />;
  }

  const toProductCard = (fav: FavoriteItem) => ({
    id: fav.id,
    name: fav.name,
    slug: fav.slug,
    price: fav.price,
    currency: "ARS",
    category: fav.category ?? "",
    room: fav.room ?? "",
    imageUrl: fav.imageUrl ?? undefined,
    store: fav.storeSlug || fav.storeName ? { name: fav.storeName ?? "", slug: fav.storeSlug ?? "" } : undefined,
    inStock: true,
  });

  return (
    <div className="space-y-4">
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((fav) => (
          <ProductCard key={fav.slug} product={toProductCard(fav)} />
        ))}
      </div>
      <Link
        href="/productos"
        className="inline-flex items-center justify-center rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
      >
        Seguir explorando
      </Link>
    </div>
  );
}
