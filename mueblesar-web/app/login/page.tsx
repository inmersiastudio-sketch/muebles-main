"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "../context/ToastContext";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL environment variable is required");
}

export default function LoginPage() {
    const router = useRouter();
    const { success, error: showError } = useToast();
    const [loading, setLoading] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showVerificationMsg, setShowVerificationMsg] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Check if already logged in
    useEffect(() => {
        const check = async () => {
            try {
                const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: "include" });
                const data = await res.json();
                if (data.user) {
                    router.push("/admin");
                    return;
                }
            } catch { }
            setCheckingAuth(false);
        };
        check();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setShowVerificationMsg(false);
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.code === "EMAIL_NOT_VERIFIED") {
                    setShowVerificationMsg(true);
                    setError(data.message || "Verificá tu email antes de iniciar sesión.");
                    showError(data.message || "Verificá tu email antes de iniciar sesión.");
                } else {
                    setError(data.error || "Credenciales incorrectas");
                    showError(data.error || "Credenciales incorrectas");
                }
                setLoading(false);
                return;
            }

            success("¡Bienvenido! Iniciando sesión...");

            router.push("/admin");
        } catch {
            setError("Error de conexión. Intentá nuevamente.");
            showError("Error de conexión. Intentá nuevamente.");
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        try {
            await fetch(`${API_BASE}/api/auth/resend-verification`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            setError("✅ Email de verificación reenviado. Revisá tu bandeja.");
            success("Email de verificación reenviado. Revisá tu bandeja.");
            setShowVerificationMsg(false);
        } catch {
            setError("No se pudo reenviar. Intentá más tarde.");
            showError("No se pudo reenviar el email. Intentá más tarde.");
        }
    };

    if (checkingAuth) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-[#1d4ed8] flex items-center justify-center animate-pulse shadow-lg shadow-[#1d4ed8]/20">
                    <span className="text-white font-black text-xl">A</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-white selection:bg-[#1d4ed8] selection:text-white">
            {/* ─── Left Side: Visual/Branding ─── */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#f1f5f9]">
                {/* Background image */}
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200"
                        alt="Interior design"
                        className="w-full h-full object-cover"
                    />
                    {/* Subtle gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />
                </div>

                {/* Content */}
                <div className="relative z-20 flex flex-col justify-between p-12 w-full h-full">
                    {/* Logo top */}
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
                            <span className="text-[#1d4ed8] font-black text-lg">A</span>
                        </div>
                        <span className="text-white font-bold text-xl tracking-tight">AMOBLY</span>
                    </div>

                    {/* Motivational text bottom */}
                    <div className="space-y-6 mb-8">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-white text-sm font-medium">Portal para Mueblerías</span>
                        </div>

                        <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.1]">
                            Potenciá tus ventas<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-200">
                                con tecnología 3D
                            </span>
                        </h2>

                        <p className="text-lg text-white/90 max-w-md leading-relaxed font-light">
                            Tus clientes pueden visualizar cada mueble en su casa antes de comprar. 
                            Aumentá tu conversión y modernizá tu catálogo hoy.
                        </p>
                    </div>
                </div>
            </div>

            {/* ─── Right Side: Login Form ─── */}
            <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-6 sm:p-12 relative">
                {/* Back link - Top Right */}
                <Link href="/" className="absolute top-8 right-8 text-[#64748b] hover:text-[#0f172a] text-sm font-medium transition-colors hidden sm:block">
                    Volver al inicio
                </Link>

                <div className="w-full max-w-[420px]">
                    {/* Mobile logo */}
                    <div className="lg:hidden text-center mb-10">
                        <div className="inline-flex w-14 h-14 rounded-2xl bg-[#1d4ed8] items-center justify-center shadow-lg shadow-[#1d4ed8]/20 mb-4">
                            <span className="text-white font-black text-xl">A</span>
                        </div>
                        <h1 className="text-2xl font-extrabold text-[#0f172a]">Portal de Mueblerías</h1>
                    </div>

                    {/* Desktop title */}
                    <div className="hidden lg:block mb-10">
                        <h1 className="text-[32px] font-extrabold text-[#0f172a] tracking-tight">Iniciar sesión</h1>
                        <p className="text-[#64748b] text-[15px] mt-2">Ingresá a tu panel para gestionar tus productos e inventario</p>
                    </div>

                    {/* Login Card */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className={`rounded-xl px-4 py-3.5 text-sm font-medium ${showVerificationMsg
                                ? "bg-amber-50 border border-amber-200 text-amber-800"
                                : error.startsWith("✅")
                                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                                    : "bg-red-50 border border-red-200 text-red-800"
                                }`}>
                                {error}
                                {showVerificationMsg && (
                                    <button
                                        type="button"
                                        onClick={handleResendVerification}
                                        className="block mt-2 text-amber-700 hover:text-amber-900 underline text-xs font-bold transition-colors"
                                    >
                                        Reenviar email de verificación
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-[#334155]">Correo electrónico</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                                placeholder="tu@muebleria.com"
                                required
                                className="w-full bg-white border border-[#cbd5e1] rounded-xl px-4 py-3.5 text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#1d4ed8] focus:ring-4 focus:ring-[#1d4ed8]/10 transition-all text-[15px] shadow-sm"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-bold text-[#334155]">Contraseña</label>
                                <Link href="/recuperar-contrasena" className="text-[#1d4ed8] hover:text-[#1e40af] transition-colors text-sm font-semibold">
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                                placeholder="••••••••"
                                required
                                className="w-full bg-white border border-[#cbd5e1] rounded-xl px-4 py-3.5 text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#1d4ed8] focus:ring-4 focus:ring-[#1d4ed8]/10 transition-all text-[15px] shadow-sm"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !email || !password}
                            className="w-full mt-2 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-semibold py-3.5 rounded-xl shadow-md shadow-[#1d4ed8]/20 transition-all duration-200 disabled:opacity-60 disabled:hover:bg-[#1d4ed8] disabled:cursor-not-allowed text-[15px] active:scale-[0.98] flex justify-center items-center h-[52px]"
                        >
                            {loading ? (
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            ) : "Iniciar sesión"}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="mt-8 pt-8 border-t border-[#e2e8f0]">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <p className="text-[#64748b] text-[15px]">¿Tu mueblería aún no está en Amobly?</p>
                            <Link
                                href="/registrar"
                                className="inline-flex items-center justify-center w-full bg-white hover:bg-[#f8fafc] border-2 border-[#e2e8f0] text-[#334155] font-semibold py-3.5 px-6 rounded-xl transition-all text-[15px]"
                            >
                                Registrar mi negocio
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Back link */}
                    <div className="text-center mt-10 sm:hidden">
                        <Link href="/" className="text-[#64748b] hover:text-[#0f172a] text-[15px] font-medium transition-colors">
                            ← Volver al sitio
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
