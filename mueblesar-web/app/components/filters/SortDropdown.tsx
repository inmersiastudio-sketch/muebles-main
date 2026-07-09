"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export type SortOption = {
  value: string;
  label: string;
  direction: "asc" | "desc";
};

const SORT_OPTIONS: SortOption[] = [
  { value: "relevance", label: "Relevancia", direction: "desc" },
  { value: "price", label: "Precio: menor a mayor", direction: "asc" },
  { value: "price", label: "Precio: mayor a menor", direction: "desc" },
  { value: "name", label: "Nombre: A-Z", direction: "asc" },
  { value: "name", label: "Nombre: Z-A", direction: "desc" },
  { value: "newest", label: "Más recientes", direction: "desc" },
];

interface SortDropdownProps {
  value: SortOption;
  onChange: (option: SortOption) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = SORT_OPTIONS.find(
    (opt) => opt.value === value.value && opt.direction === value.direction
  )?.label || "Ordenar por";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[var(--gray-200)] rounded-xl text-sm font-medium text-[var(--gray-700)] hover:border-[var(--gray-300)] hover:bg-[var(--gray-50)] transition-colors"
      >
        <ArrowUpDown className="w-4 h-4 text-[var(--gray-400)]" />
        <span className="hidden sm:inline">{selectedLabel}</span>
        <span className="sm:hidden">Ordenar</span>
        <ChevronDown className={`w-4 h-4 text-[var(--gray-400)] transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-[var(--gray-200)] shadow-lg z-50 py-1">
          {SORT_OPTIONS.map((option) => {
            const isSelected = value.value === option.value && value.direction === option.direction;
            return (
              <button
                key={`${option.value}-${option.direction}`}
                type="button"
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                  isSelected
                    ? "bg-[var(--primary-50)] text-[var(--primary-600)] font-medium"
                    : "text-[var(--gray-700)] hover:bg-[var(--gray-50)]"
                }`}
              >
                <span>{option.label}</span>
                {isSelected && (
                  option.direction === "asc" ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
