"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "../context/ToastContext";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export default function RegistrarPage() {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    ownerName: "",
    whatsapp: "",
    address: "",
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/register-store`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          ownerName: formData.ownerName,
          whatsapp: formData.whatsapp,
          address: formData.address,
          description: formData.description || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al registrar la mueblería");
        showError(data.error || "Error al registrar la mueblería");
        setLoading(false);
        return;
      }

      success("¡Registro exitoso! Verificá tu email para continuar.");
      // Redirect to email verification page
      router.push(`/verificar-email?email=${encodeURIComponent(formData.email)}`);
    } catch {
      setError("Error de conexión. Intentá nuevamente.");
      showError("Error de conexión. Intentá nuevamente.");
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#0058a3] focus:ring-2 focus:ring-[#0058a3]/20 transition-all text-sm";
  const labelClass = "block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5";

  return (
    <div className="min-h-screen flex">
      {/* ─── Left Side: Motivational ─── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-[#001d3d] via-[#003566] to-[#0058a3]">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
        <div className="absolute inset-0">
          <img
            src="/images/login-hero.webp"
            alt="Showroom de muebles"
            className="w-full h-full object-cover opacity-40"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>

        <div className="relative z-20 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
              <span className="text-white font-black text-lg">A</span>
            </div>
            <span className="text-white/80 font-bold text-lg">Amobly</span>
          </div>

          {/* Benefits */}
          <div className="space-y-8">
            <h2 className="text-4xl font-extrabold text-white leading-tight">
              Empezá a vender<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                en minutos
              </span>
            </h2>

            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v13.5A1.5 1.5 0 003.75 21z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-bold">Subí fotos, generá modelos 3D</p>
                  <p className="text-slate-400 text-sm">Nuestra IA convierte fotos de muebles en modelos 3D automáticamente</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-bold">Tus clientes ven muebles en AR</p>
                  <p className="text-slate-400 text-sm">Los compradores visualizan los productos en su casa desde el celular</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white font-bold">Dashboard de analytics</p>
                  <p className="text-slate-400 text-sm">Seguí métricas de vistas AR, productos más vistos y conversiones</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
              <p className="text-slate-300 text-sm italic">&ldquo;Desde que usamos Amobly, las consultas por WhatsApp aumentaron un 60%. Los clientes ya saben qué quieren cuando nos escriben.&rdquo;</p>
              <p className="text-slate-500 text-xs mt-2">— María, Muebles Córdoba</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Right Side: Register Form ─── */}
      <div className="w-full lg:w-[55%] flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-[#002f5e] p-6 sm:p-8 overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-6">
            <div className="inline-flex w-14 h-14 rounded-2xl bg-[#0058a3] items-center justify-center shadow-lg shadow-[#0058a3]/30 mb-3">
              <span className="text-white font-black text-xl">A</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Registrar mueblería</h1>
          </div>

          {/* Desktop title */}
          <div className="hidden lg:block mb-6">
            <h1 className="text-3xl font-extrabold text-white">Registrar mueblería</h1>
            <p className="text-slate-400 text-sm mt-2">Completá los datos para crear tu cuenta en Amobly</p>
          </div>

          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-300 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5">
            {/* Store info */}
            <div>
              <p className="text-xs font-bold text-[#0058a3] uppercase tracking-wider mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
                </svg>
                Información de la mueblería
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Nombre de la mueblería *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Muebles del Sur" required className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>WhatsApp *</label>
                  <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="+5493512345678" required className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>Dirección *</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Av. Colón 1234" required className={inputClass} />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Descripción <span className="text-slate-500 font-normal normal-case">(opcional)</span></label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Breve descripción de tu mueblería..."
                    rows={2}
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10" />

            {/* Account info */}
            <div>
              <p className="text-xs font-bold text-[#0058a3] uppercase tracking-wider mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                Datos del responsable
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Nombre *</label>
                  <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} placeholder="Juan Pérez" required className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="juan@muebleria.com" required className={inputClass} />
                </div>

                <div>
                  <label className={labelClass}>Contraseña *</label>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Mínimo 8 caracteres" required className={inputClass} />
                  <p className="mt-1 text-[10px] text-slate-500">Mayúscula, minúscula y número</p>
                </div>

                <div>
                  <label className={labelClass}>Confirmar *</label>
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Repetí contraseña" required className={inputClass} />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0058a3] hover:bg-[#004f93] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#0058a3]/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creando cuenta...
                </span>
              ) : "Crear mi cuenta"}
            </button>
          </form>

          {/* Login link */}
          <div className="mt-5 text-center">
            <p className="text-slate-400 text-sm">
              ¿Ya tenés cuenta?{" "}
              <Link href="/login" className="text-[#0058a3] hover:text-[#3b8fd4] font-bold transition-colors">
                Iniciar sesión
              </Link>
            </p>
          </div>

          <div className="text-center mt-4">
            <Link href="/" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
              ← Volver al sitio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
