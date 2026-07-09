"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Simplified types for the search results
type SearchResult = {
  products: { id: number; name: string; slug: string; price: number; imageUrl: string | null }[];
  stores: { id: number; name: string; slug: string; logoUrl: string | null }[];
};

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      setShowDropdown(false);
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const [productsRes, storesRes] = await Promise.all([
          fetch(`/api/products?q=${encodeURIComponent(query)}&pageSize=5`),
          fetch(`/api/stores?q=${encodeURIComponent(query)}`),
        ]);
        
        let products = [];
        let stores = [];
        
        if (productsRes.ok) {
           const data = await productsRes.json();
           products = data.items || [];
        }
        
        if (storesRes.ok) {
            const data = await storesRes.json();
            stores = data.items || [];
        }

        setResults({
          products: products.slice(0, 5),
          stores: stores.slice(0, 3),
        });
        setShowDropdown(true);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(query.trim())}`);
      setShowDropdown(false);
      setQuery("");
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
        <input
          type="search"
          placeholder="¿Qué estás buscando?"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-gray-100/50 hover:bg-gray-100 focus:bg-white border-2 border-transparent focus:border-gray-900 rounded-full outline-none transition-all placeholder:text-gray-500 text-sm font-medium"
          aria-label="Buscar productos y tiendas"
        />
        {loading && (
            <div className="absolute inset-y-0 right-4 flex items-center">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900"></div>
            </div>
        )}
      </form>

      {showDropdown && results && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
          {/* Products Section */}
          {results.products.length > 0 && (
            <div className="py-2">
              <h3 className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Productos</h3>
              <ul>
                {results.products.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/productos/${product.slug}`}
                      onClick={() => {
                        setShowDropdown(false);
                        setQuery("");
                      }}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                    >
                      <div className="h-10 w-10 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        {product.imageUrl ? (
                           <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                           <div className="h-full w-full flex items-center justify-center text-gray-400">
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                           </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{product.name}</div>
                        <div className="text-xs text-gray-500 font-semibold">${product.price?.toLocaleString() ?? 0}</div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Stores Section */}
          {results.stores.length > 0 && (
            <div className="py-2 border-t border-gray-100">
              <h3 className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Mueblerías</h3>
              <ul>
                {results.stores.map((store) => (
                  <li key={store.id}>
                    <Link
                      href={`/catalog/${store.slug}`}
                      onClick={() => {
                        setShowDropdown(false);
                        setQuery("");
                      }}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                    >
                      <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                        {store.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="text-sm font-medium text-gray-900 truncate">{store.name}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Empty State */}
          {results.products.length === 0 && results.stores.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-500">No encontramos resultados para &quot;{query}&quot;</p>
            </div>
          )}

          {/* View All Link */}
          {(results.products.length > 0 || results.stores.length > 0) && (
            <div className="p-2 border-t border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full py-2 px-4 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors"
              >
                Ver todos los resultados ({results.products.length + results.stores.length}+)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
