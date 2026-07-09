"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
// import { cn } from "@/app/lib/utils";

// Simple class merger/joiner to replace 'cn' if not available
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

const categories = [
  {
    id: "sofas",
    label: "Sofás",
    image: "/categories/sofas.png", 
  },
  {
    id: "sillas",
    label: "Sillas",
    image: "/categories/sillas.png",
  },
  {
    id: "mesas",
    label: "Mesas",
    image: "/categories/mesas.png",
  },
  {
    id: "camas",
    label: "Camas",
    image: "/categories/camas.png",
  },
  {
    id: "armarios",
    label: "Armarios",
    image: "/categories/armarios.png",
  },
  {
    id: "iluminacion",
    label: "Iluminación",
    image: "/categories/iluminacion.png",
  },
];

export function VisualCategoryFilter() {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  return (
    <div className="w-full overflow-x-auto pb-4 pt-2">
      <div className="flex min-w-max gap-4 px-1">
        {categories.map((cat) => {
          const isActive = currentCategory === cat.id;
          return (
            <Link
              key={cat.id}
              href={isActive ? "/buscar" : `/buscar?category=${cat.id}`}
              className={cn(
                "group flex flex-col items-center gap-2 rounded-xl border p-4 transition-all hover:border-slate-400 hover:shadow-md",
                isActive
                  ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary"
                  : "border-slate-200 bg-white text-slate-500"
              )}
            >
              <div
                className={cn(
                  "relative flex h-16 w-16 items-center justify-center rounded-lg transition-colors overflow-hidden",
                  isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600"
                )}
              >
                {/* Blueprint Style Image if present, fallback handled by placeholder logic or empty */}
                <div className="relative w-full h-full p-1">
                   {cat.image ? (
                     <Image 
                       src={cat.image} 
                       alt={cat.label} 
                       fill
                       className="object-contain"
                       sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                     />
                   ) : (
                    <span className="text-[10px] text-center">No Img</span>
                   )}
                </div>
              </div>
              <span
                className={cn(
                  "text-sm font-medium",
                  isActive ? "text-primary" : "text-slate-600 group-hover:text-slate-900"
                )}
              >
                {cat.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
