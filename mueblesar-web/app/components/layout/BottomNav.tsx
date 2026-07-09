"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "../../context/CartContext";
import { Home, Grid3X3, ShoppingCart, User } from "lucide-react";

const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/productos", label: "Catálogo", icon: Grid3X3 },
  { href: "/carrito", label: "Carrito", icon: ShoppingCart },
  { href: "/login", label: "Cuenta", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // No mostrar en páginas de admin o auth
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/login") && pathname !== "/login") {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[var(--gray-200)] md:hidden safe-area-pb">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive 
                  ? "text-[var(--primary-600)]" 
                  : "text-[var(--gray-500)] hover:text-[var(--gray-700)]"
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                {item.href === "/carrito" && cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--error-500)] text-[10px] font-bold text-white">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </div>
              <span className="mt-0.5 text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[var(--primary-600)] rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
