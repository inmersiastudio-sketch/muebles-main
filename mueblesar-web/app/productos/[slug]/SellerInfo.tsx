"use client";

import { Store, Star, CheckCircle, Clock, MessageCircle } from "lucide-react";
import Link from "next/link";

interface Store {
  id: number;
  name: string;
  slug: string;
  address?: string | null;
  phone?: string | null;
}

interface SellerInfoProps {
  store: Store;
  rating: number;
  salesCount: number;
  responseTime: string;
}

export function SellerInfo({ store, rating, salesCount, responseTime }: SellerInfoProps) {
  return (
    <div className="rounded-2xl border border-[#e2e8f0] bg-white p-5 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 font-bold text-[#0f172a]">
        <Store className="h-5 w-5 text-[#1d4ed8]" />
        Sobre el vendedor
      </h3>

      <div className="flex items-start gap-3 mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1d4ed8] text-lg font-bold text-white">
          {store.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <Link 
            href={`/catalog/${store.slug}`}
            className="font-bold text-[#0f172a] transition-colors hover:text-[#1d4ed8]"
          >
            {store.name}
          </Link>
          <p className="text-xs text-[#64748b]">Mueblería oficial • {salesCount}+ ventas</p>
          
          {/* Rating Bar */}
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-[#3b82f6] to-[#2563eb]"
                  style={{ width: `${(rating / 5) * 100}%` }}
                />
              </div>
              <span className="text-xs font-bold text-[#1d4ed8]">{rating.toFixed(1)}</span>
            </div>
            <p className="mt-1 text-[10px] text-[#94a3b8]">EXCELENTE</p>
          </div>
        </div>
      </div>

      {/* Seller Badges */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-[#475569]">
          <CheckCircle className="h-4 w-4 text-[#1d4ed8]" />
          <span>Brinda buena atención</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#475569]">
          <Clock className="h-4 w-4 text-[#1d4ed8]" />
          <span>Despacha a tiempo</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#475569]">
          <MessageCircle className="h-4 w-4 text-[#1d4ed8]" />
          <span>Responde en {responseTime}</span>
        </div>
      </div>

      <Link
        href={`/catalog/${store.slug}`}
        className="mt-4 block w-full rounded-xl border border-[#cbd5e1] px-4 py-2 text-center text-sm font-semibold text-[#334155] transition-colors hover:bg-[#f8fafc]"
      >
        Ver todos sus productos →
      </Link>
    </div>
  );
}
