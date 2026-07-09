"use client";

import { Users } from "lucide-react";

export default function UsersPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Usuarios</h1>
                <p className="text-sm text-slate-500 mt-0.5">Gestión de usuarios y permisos</p>
            </div>

            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0058a3]/10 to-violet-500/10 flex items-center justify-center mb-6">
                    <Users size={36} className="text-[#0058a3]" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Gestión de Equipo</h2>
                <p className="text-sm text-slate-500 max-w-md mb-6">
                    Sección en desarrollo. Podrás invitar a tu equipo con roles diferenciados (Admin, Operador, Solo Lectura) para gestionar los productos de tu mueblería.
                </p>
            </div>
        </div>
    );
}
