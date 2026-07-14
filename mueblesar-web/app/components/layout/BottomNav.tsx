"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid3X3, Home, User } from "lucide-react";

const navItems = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/productos", label: "Catalogo", icon: Grid3X3 },
  { href: "/login", label: "Cuenta", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin") || (pathname?.startsWith("/login") && pathname !== "/login")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--gray-200)] bg-white md:hidden safe-area-pb">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const isActive = item.href === "/"
            ? pathname === item.href
            : pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex h-full flex-1 flex-col items-center justify-center transition-colors ${
                isActive
                  ? "text-[var(--primary-600)]"
                  : "text-[var(--gray-500)] hover:text-[var(--gray-700)]"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="mt-0.5 text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <span className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-[var(--primary-600)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
