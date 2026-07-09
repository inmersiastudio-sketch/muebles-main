"use client";

import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "../components/products/ProductCard";
import type { ProductListItem } from "@/types";
import { EmptySearch, NoResultsWithFilters } from "../components/ui/EmptyState";
import { PriceRangeSlider } from "../components/filters/PriceRangeSlider";
import { SortDropdown, SortOption } from "../components/filters/SortDropdown";

const ROOMS = ["Todos", "Living", "Comedor", "Dormitorio", "Baño", "Cocina", "Oficina", "Exterior"];

const PAGE_SIZE = 8;

interface Props {
  initialProducts: ProductListItem[];
}

export function ProductsClient({ initialProducts }: Props) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showFilters, setShowFilters] = useState(true);

  // Price range state
  const prices = useMemo(() => initialProducts.map((p) => p.price), [initialProducts]);
  const minPrice = useMemo(() => (prices.length > 0 ? Math.min(...prices) : 0), [prices]);
  const maxPrice = useMemo(() => (prices.length > 0 ? Math.max(...prices) : 1000000), [prices]);
  const [priceRange, setPriceRange] = useState<[number, number]>([minPrice, maxPrice]);

  // Sort state
  const [sort, setSort] = useState<SortOption>({ value: "relevance", label: "Relevancia", direction: "desc" });

  const filtered = useMemo(() => {
    let items = [...initialProducts];

    // Room filter
    if (selectedCategory !== "Todos") {
      const q = selectedCategory.toLowerCase();
      items = items.filter((p) => {
        const room = (p.room ?? "").toLowerCase();
        return room === q || room.includes(q) || q.includes(room);
      });
    }

    // Search filter
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.category ?? "").toLowerCase().includes(q) ||
          (p.room ?? "").toLowerCase().includes(q)
      );
    }

    // Price filter
    items = items.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Sort
    switch (sort.value) {
      case "price":
        items.sort((a, b) =>
          sort.direction === "asc" ? a.price - b.price : b.price - a.price
        );
        break;
      case "name":
        items.sort((a, b) =>
          sort.direction === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        );
        break;
      case "newest":
        items.sort((a, b) =>
          sort.direction === "asc" ? a.id - b.id : b.id - a.id
        );
        break;
      default:
        // relevance - no sorting, keep original order
        break;
    }

    return items;
  }, [initialProducts, selectedCategory, search, priceRange, sort]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const activeFiltersCount =
    (selectedCategory !== "Todos" ? 1 : 0) +
    (search ? 1 : 0) +
    (priceRange[0] !== minPrice || priceRange[1] !== maxPrice ? 1 : 0);

  function handleCategoryChange(cat: string) {
    setSelectedCategory(cat);
    setVisibleCount(PAGE_SIZE);
  }

  function handleSearch(value: string) {
    setSearch(value);
    setVisibleCount(PAGE_SIZE);
  }

  function handleClearFilters() {
    setSearch("");
    setSelectedCategory("Todos");
    setPriceRange([minPrice, maxPrice]);
    setSort({ value: "relevance", label: "Relevancia", direction: "desc" });
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--gray-900)]">Catálogo</h1>
          <p className="text-[var(--gray-500)] mt-1">Descubrí nuestra colección de muebles premium</p>
        </div>

        {/* Search, Sort & Filter */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 bg-white border border-[var(--gray-200)] rounded-xl px-3 sm:px-4 py-2.5 focus-within:border-[var(--primary-600)] focus-within:ring-1 focus-within:ring-[var(--primary-600)] transition-all">
            <Search className="w-4 h-4 text-[var(--gray-400)] shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Buscar..."
              className="bg-transparent border-none outline-none text-sm w-24 sm:w-32 lg:w-48 placeholder:text-[var(--gray-400)] text-[var(--gray-900)]"
            />
            {search && (
              <button type="button" onClick={() => handleSearch("")} className="text-[var(--gray-400)] hover:text-[var(--gray-900)]">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <SortDropdown value={sort} onChange={setSort} />

          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 border rounded-xl px-3 sm:px-4 py-2.5 font-semibold transition-colors ${showFilters
              ? "bg-[var(--primary-600)] border-[var(--primary-600)] text-white"
              : "bg-white border-[var(--gray-200)] text-[var(--gray-900)] hover:bg-[var(--gray-50)]"
              }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filtros</span>
            {activeFiltersCount > 0 && (
              <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${showFilters ? "bg-white text-[var(--primary-600)]" : "bg-[var(--primary-600)] text-white"}`}>
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col items-start gap-6 lg:gap-8 lg:flex-row mt-6">
        {/* Sidebar Filters */}
        {showFilters && (
          <aside className="w-full shrink-0 lg:w-[280px]">
            <div className="bg-white rounded-xl border border-[var(--gray-200)] p-4">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--gray-200)]">
                <h3 className="font-bold text-lg text-[var(--gray-900)]">Filtros</h3>
                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="text-sm font-medium text-[var(--primary-600)] hover:text-[var(--primary-700)] transition-colors"
                  >
                    Limpiar todo
                  </button>
                )}
              </div>

              {/* Room Filter */}
              <div className="py-4 border-b border-[var(--gray-200)]">
                <h4 className="font-semibold text-[var(--gray-900)] mb-3">Ambiente</h4>
                <div className="flex flex-wrap gap-2">
                  {ROOMS.map((room) => (
                    <button
                      key={room}
                      type="button"
                      onClick={() => handleCategoryChange(room)}
                      className={`px-3 py-1.5 text-sm rounded-full transition-colors ${selectedCategory === room
                        ? "bg-[var(--primary-600)] text-white"
                        : "bg-[var(--gray-100)] text-[var(--gray-700)] hover:bg-[var(--gray-200)]"
                        }`}
                    >
                      {room}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="py-4">
                <h4 className="font-semibold text-[var(--gray-900)] mb-2">Rango de precio</h4>
                <PriceRangeSlider
                  min={minPrice}
                  max={maxPrice}
                  value={priceRange}
                  onChange={(value) => {
                    setPriceRange(value);
                    setVisibleCount(PAGE_SIZE);
                  }}
                  step={10000}
                />
              </div>
            </div>
          </aside>
        )}

        {/* Content Area */}
        <div className="flex-1 min-w-0 w-full">
          {/* Results bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <p className="text-sm text-[var(--gray-500)]">
              {filtered.length} {filtered.length === 1 ? "producto" : "productos"}
              {selectedCategory !== "Todos" && (
                <span className="text-[var(--gray-900)]"> en <span className="font-medium">{selectedCategory}</span></span>
              )}
              {search && (
                <span className="text-[var(--gray-900)]"> para <span className="font-medium">"{search}"</span></span>
              )}
            </p>

            {/* Active filter chips */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {selectedCategory !== "Todos" && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--primary-50)] text-[var(--primary-700)] text-xs rounded-full">
                    {selectedCategory}
                    <button onClick={() => setSelectedCategory("Todos")} className="hover:text-[var(--primary-900)]">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {(priceRange[0] !== minPrice || priceRange[1] !== maxPrice) && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--primary-50)] text-[var(--primary-700)] text-xs rounded-full">
                    ${(priceRange[0] / 1000).toFixed(0)}k - ${(priceRange[1] / 1000).toFixed(0)}k
                    <button onClick={() => setPriceRange([minPrice, maxPrice])} className="hover:text-[var(--primary-900)]">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Products Grid */}
          {visible.length > 0 ? (
            <div className={`grid grid-cols-2 gap-3 sm:gap-4 ${showFilters ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
              {visible.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : search ? (
            <EmptySearch query={search} />
          ) : (
            <NoResultsWithFilters onClear={handleClearFilters} />
          )}

          {/* Load More */}
          {hasMore && visible.length > 0 && (
            <div className="mt-8 sm:mt-12 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--gray-200)] bg-white px-6 sm:px-8 py-2.5 sm:py-3 font-semibold text-[var(--gray-900)] transition-colors hover:bg-[var(--gray-50)]"
              >
                Cargar más ({filtered.length - visibleCount})
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
