"use client";

import { Box } from "lucide-react";

export default function MediaPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Media</h1>
                <p className="text-sm text-slate-500 mt-0.5">Gestión de archivos multimedia</p>
            </div>

            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0058a3]/10 to-violet-500/10 flex items-center justify-center mb-6">
                    <Box size={36} className="text-[#0058a3]" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Centro de Medios</h2>
                <p className="text-sm text-slate-500 max-w-md">
                    Sección en desarrollo. Podrás gestionar todos tus modelos 3D (GLB/USDZ) e imágenes desde un único lugar.
                </p>
            </div>
        </div>
    );
}
