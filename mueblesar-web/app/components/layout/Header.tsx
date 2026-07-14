"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, User, Menu, X, Sofa, Heart } from "lucide-react";

const nav = [
  { href: "/productos", label: "Catálogo" },
  { href: "/mueblerias", label: "Mueblerías" },
  { href: "/productos?sort=price_asc", label: "Ofertas" }
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const lastScrollY = useRef(0);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      setIsAtTop(currentScrollY < 10);
      
      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out
          ${isVisible ? "translate-y-0" : "-translate-y-full"}
          ${!isAtTop ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-white"}
        `}
      >
        <div className="mx-auto w-full max-w-[1700px] px-3 sm:px-4 lg:px-8">
          {/* Main Header Row - Más compacto */}
          <div className="flex h-12 sm:h-14 items-center justify-between gap-3">
            {/* Logo - Más compacto */}
            <Link href="/" className="flex items-center gap-1.5 flex-shrink-0">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--primary-600)] text-white shadow-sm">
                <Sofa className="h-4 w-4" />
              </span>
              <span className="text-lg sm:text-xl font-bold text-[var(--gray-900)] tracking-tight">AMOBLY</span>
            </Link>

            {/* Desktop Navigation - Más minimal */}
            <nav className="hidden lg:flex items-center">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-3 py-1.5 text-sm font-medium text-[var(--gray-600)] rounded-lg transition-colors hover:text-[var(--primary-600)] hover:bg-[var(--primary-50)]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-[400px] mx-4">
              <div className="w-full relative">
                <div className="flex items-center rounded-xl border border-[var(--gray-200)] bg-white px-3 py-2 shadow-sm focus-within:border-[var(--primary-600)] focus-within:ring-2 focus-within:ring-[var(--primary-100)] transition-all">
                  <button
                    type="submit"
                    className="mr-2 flex shrink-0 items-center justify-center text-[var(--gray-400)] transition-colors hover:text-[var(--primary-600)] disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Buscar"
                    title="Buscar"
                    disabled={!searchQuery.trim()}
                  >
                    <Search className="h-4 w-4" />
                  </button>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar muebles..."
                    className="w-full border-none bg-transparent text-sm text-[var(--gray-700)] outline-none placeholder:text-[var(--gray-400)]"
                  />
                </div>
              </div>
            </form>

            {/* Right Actions - Más compacto */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              {/* Favoritos - Desktop */}
              <Link
                href="/favoritos"
                className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full text-[var(--gray-500)] transition-colors hover:bg-[var(--gray-100)] hover:text-[var(--gray-900)]"
                aria-label="Favoritos"
              >
                <Heart className="w-[18px] h-[18px]" />
              </Link>

              {/* Mi Cuenta - Desktop */}
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-[var(--primary-600)] px-3 sm:px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-700)] active:scale-95"
              >
                <User className="w-4 h-4" />
                <span className="hidden lg:inline">Mi Cuenta</span>
              </Link>

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-[var(--gray-600)] hover:bg-[var(--gray-100)] rounded-full transition-colors"
                aria-label="Abrir menú"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mobile Search - Más compacto */}
          <form onSubmit={handleSearch} className="pb-2 md:hidden">
            <div className="flex items-center rounded-full border border-[var(--gray-200)] bg-[var(--gray-50)] px-3 py-2 focus-within:bg-white focus-within:border-[var(--primary-600)] transition-all">
              <button
                type="submit"
                className="mr-2 flex shrink-0 items-center justify-center text-[var(--gray-400)] transition-colors hover:text-[var(--primary-600)] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Buscar"
                title="Buscar"
                disabled={!searchQuery.trim()}
              >
                <Search className="h-4 w-4" />
              </button>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar muebles..."
                className="w-full border-none bg-transparent text-sm text-[var(--gray-700)] outline-none placeholder:text-[var(--gray-400)]"
              />
            </div>
          </form>
        </div>
      </header>

      {/* Spacer - Ajustado */}
      <div className="h-[88px] md:h-[58px]" />

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          <div className="absolute right-0 top-0 h-full w-[280px] bg-white shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[var(--gray-100)] px-4 py-3">
              <span className="text-base font-semibold text-[var(--gray-900)]">Menú</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-[var(--gray-500)] hover:bg-[var(--gray-100)] rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex flex-col p-2">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-[15px] font-medium text-[var(--gray-700)] rounded-xl hover:bg-[var(--gray-50)] hover:text-[var(--primary-600)] transition-colors"
                >
                  {item.label}
                </Link>
              ))}

              <hr className="my-2 border-[var(--gray-100)]" />

              <Link
                href="/favoritos"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-[15px] font-medium text-[var(--gray-700)] rounded-xl hover:bg-[var(--gray-50)] hover:text-[var(--primary-600)] transition-colors"
              >
                <Heart className="w-5 h-5" />
                Favoritos
              </Link>

              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-[15px] font-medium text-[var(--gray-700)] rounded-xl hover:bg-[var(--gray-50)] hover:text-[var(--primary-600)] transition-colors"
              >
                <User className="w-5 h-5" />
                Mi cuenta
              </Link>

            </nav>
          </div>
        </div>
      )}
    </>
  );
}
