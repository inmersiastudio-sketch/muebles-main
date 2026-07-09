"use client";

import { Store } from "lucide-react";

export default function StoresPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Tiendas</h1>
                <p className="text-sm text-slate-500 mt-0.5">Administración de mueblerías</p>
            </div>

            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0058a3]/10 to-violet-500/10 flex items-center justify-center mb-6">
                    <Store size={36} className="text-[#0058a3]" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Gestión de Tiendas</h2>
                <p className="text-sm text-slate-500 max-w-md">
                    Sección en desarrollo. Podrás administrar múltiples mueblerías, planes, límites de productos y onboarding de clientes B2B.
                </p>
            </div>
        </div>
    );
}
