"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Armchair, BedDouble, DoorOpen, Lamp, Table2, type LucideIcon } from "lucide-react";
// import { cn } from "@/app/lib/utils";

// Simple class merger/joiner to replace 'cn' if not available
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

type VisualCategory = {
  id: string;
  label: string;
  image?: string;
  icon: LucideIcon;
};

const categories: VisualCategory[] = [
  {
    id: "sillon",
    label: "Sillones",
    icon: Armchair,
  },
  {
    id: "sofas",
    label: "Sofás",
    image: "/categories/sofas.png",
    icon: Armchair,
  },
  {
    id: "sillas",
    label: "Sillas",
    icon: Armchair,
  },
  {
    id: "mesas",
    label: "Mesas",
    icon: Table2,
  },
  {
    id: "camas",
    label: "Camas",
    icon: BedDouble,
  },
  {
    id: "armarios",
    label: "Armarios",
    icon: DoorOpen,
  },
  {
    id: "iluminacion",
    label: "Iluminación",
    icon: Lamp,
  },
];

export function VisualCategoryFilter() {
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");

  const categoryHref = (categoryId: string, isActive: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (isActive) params.delete("category");
    else params.set("category", categoryId);
    const query = params.toString();
    return query ? `/buscar?${query}` : "/buscar";
  };

  return (
    <div className="w-full overflow-x-auto pb-4 pt-2">
      <div className="flex min-w-max gap-4 px-1">
        {categories.map((cat) => {
          const isActive = currentCategory === cat.id;
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              href={categoryHref(cat.id, isActive)}
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
                    <Icon className="h-full w-full p-3" strokeWidth={1.5} aria-hidden="true" />
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
