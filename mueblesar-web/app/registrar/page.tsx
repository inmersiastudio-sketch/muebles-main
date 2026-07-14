"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MapPin,
  MessageCircle,
  UserRound,
} from "lucide-react";
import { useToast } from "../context/ToastContext";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

type RegistrationErrorResponse = {
  error?: string;
  message?: string;
  details?: {
    fieldErrors?: Record<string, string[]>;
  };
};

type RegistrationResponse = RegistrationErrorResponse & {
  verificationEmailSent?: boolean;
};

const fieldLabels: Record<string, string> = {
  email: "Email",
  password: "Contraseña",
  name: "Nombre de la mueblería",
  ownerName: "Nombre del responsable",
  whatsapp: "WhatsApp",
  address: "Dirección",
};

function normalizeWhatsApp(value: string): string {
  return value.replace(/\D/g, "");
}

function passwordValidationMessage(password: string): string | null {
  if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
  if (!/[A-Z]/.test(password)) return "La contraseña debe incluir al menos una mayúscula.";
  if (!/[a-z]/.test(password)) return "La contraseña debe incluir al menos una minúscula.";
  if (!/[0-9]/.test(password)) return "La contraseña debe incluir al menos un número.";
  return null;
}

function registrationErrorMessage(data: RegistrationErrorResponse): string {
  if (data.message?.includes("Can't reach database server")) {
    return "La base de datos local no está activa. Iniciá PostgreSQL y volvé a intentar.";
  }

  const fieldErrors = data.details?.fieldErrors;
  const firstError = fieldErrors && Object.entries(fieldErrors).find(([, messages]) => messages.length > 0);

  if (firstError) {
    const [field, messages] = firstError;
    return `${fieldLabels[field] || field}: ${messages[0]}`;
  }

  return data.message || "No pudimos registrar la mueblería. Revisá los datos e intentá nuevamente.";
}

export default function RegistrarPage() {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((previous) => ({ ...previous, [event.target.name]: event.target.value }));
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const passwordError = passwordValidationMessage(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    const normalizedWhatsApp = normalizeWhatsApp(formData.whatsapp);
    if (normalizedWhatsApp.length < 10 || normalizedWhatsApp.length > 15) {
      setError("WhatsApp: ingresá el código de país y el número completo.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/register-store`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          name: formData.name.trim(),
          ownerName: formData.ownerName.trim(),
          whatsapp: normalizedWhatsApp,
          address: formData.address.trim(),
          description: formData.description.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({} as RegistrationResponse)) as RegistrationResponse;

      if (!res.ok) {
        const message = registrationErrorMessage(data);
        setError(message);
        showError(message);
        return;
      }

      if (data.verificationEmailSent === false) {
        const message = data.message || "La cuenta fue creada, pero no pudimos enviar el email de verificación.";
        showError(message);
        router.push(`/verificar-email?email=${encodeURIComponent(formData.email.trim())}&delivery=unavailable`);
        return;
      }

      success("Registro exitoso. Verificá tu email para continuar.");
      router.push(`/verificar-email?email=${encodeURIComponent(formData.email.trim())}`);
    } catch {
      const message = "No pudimos comunicarnos con el servidor. Verificá tu conexión e intentá nuevamente.";
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "h-11 w-full border border-[#cbd4cf] bg-white px-3 text-sm text-[#1c2421] outline-none transition-colors placeholder:text-[#8a9690] focus:border-[#0b6e5e] focus:ring-2 focus:ring-[#0b6e5e]/15";
  const iconInputClass = `${inputClass} pl-10`;
  const labelClass = "mb-2 block text-sm font-semibold text-[#34423c]";

  return (
    <main className="min-h-screen bg-white text-[#1c2421]">
      <div className="grid min-h-screen lg:grid-cols-[minmax(350px,0.78fr)_minmax(0,1.22fr)]">
        <aside className="relative hidden overflow-hidden bg-[#1c2925] px-10 py-10 lg:flex lg:flex-col xl:px-14">
          <Link href="/" className="inline-flex w-fit items-center gap-2 text-sm font-medium text-white/75 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Volver al sitio
          </Link>

          <div className="mt-auto">
            <p className="text-sm font-semibold tracking-[0.18em] text-[#e7a86e]">AMOBLY PARA MUEBLERÍAS</p>
            <h1 className="mt-4 max-w-sm text-3xl font-semibold leading-tight text-white">Empezá con una base ordenada.</h1>
            <p className="mt-4 max-w-sm text-base leading-7 text-white/70">
              Abrí tu espacio de trabajo y verificá tu correo antes de ingresar.
            </p>
          </div>

          <div className="relative mt-8 h-52 shrink-0 xl:h-60">
            <Image
              src="/sofa-hero.png"
              alt="Sofá de dos cuerpos"
              fill
              priority
              sizes="38vw"
              className="object-contain object-center"
            />
          </div>

        </aside>

        <section className="bg-[#f5f7f6] px-6 py-6 sm:px-10 lg:px-14 lg:py-10 xl:px-20">
          <header className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-[0.08em] text-[#1c2421] lg:hidden">
              <span className="flex h-8 w-8 items-center justify-center bg-[#0b6e5e] text-sm font-bold text-white">A</span>
              AMOBLY
            </Link>
            <span className="hidden text-sm text-[#61706a] lg:block">Registro de mueblería</span>
            <Link href="/login" className="text-sm font-semibold text-[#0b6e5e] transition-colors hover:text-[#075247]">Ya tengo cuenta</Link>
          </header>

          <div className="mx-auto max-w-2xl py-12 lg:py-9">
            <div className="mb-9 max-w-xl">
              <p className="text-sm font-semibold text-[#0b6e5e]">Nueva mueblería</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal text-[#1c2421]">Creá tu cuenta</h2>
              <p className="mt-3 text-base leading-6 text-[#61706a]">Completá los datos de tu mueblería y de la persona responsable.</p>
            </div>

            {error && (
              <div role="alert" className="mb-7 border-l-4 border-[#b63a2b] bg-[#fdf2f1] px-4 py-3 text-sm leading-5 text-[#80251b]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8" noValidate>
              <section aria-labelledby="store-details" className="border-t border-[#d9e0dc] pt-6">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center border border-[#b9c6bf] bg-white text-[#0b6e5e]">
                    <Building2 className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 id="store-details" className="text-base font-semibold text-[#1c2421]">Tu mueblería</h3>
                    <p className="text-sm text-[#61706a]">Información que verán tus clientes.</p>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="store-name" className={labelClass}>Nombre de la mueblería</label>
                    <div className="relative">
                      <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718078]" aria-hidden="true" />
                      <input id="store-name" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Muebles del Sur" autoComplete="organization" required className={iconInputClass} />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="store-whatsapp" className={labelClass}>WhatsApp</label>
                    <div className="relative">
                      <MessageCircle className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718078]" aria-hidden="true" />
                      <input id="store-whatsapp" type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="+54 9 351 234 5678" autoComplete="tel" inputMode="tel" required className={iconInputClass} />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="store-address" className={labelClass}>Dirección</label>
                    <div className="relative">
                      <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718078]" aria-hidden="true" />
                      <input id="store-address" type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Av. Colón 1234" autoComplete="street-address" required className={iconInputClass} />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="store-description" className={labelClass}>Descripción <span className="font-normal text-[#61706a]">(opcional)</span></label>
                    <textarea id="store-description" name="description" value={formData.description} onChange={handleChange} placeholder="Contá brevemente qué tipo de muebles ofrecés." rows={3} className={`${inputClass} h-auto resize-y py-3`} />
                  </div>
                </div>
              </section>

              <section aria-labelledby="account-details" className="border-t border-[#d9e0dc] pt-6">
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center border border-[#b9c6bf] bg-white text-[#0b6e5e]">
                    <UserRound className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 id="account-details" className="text-base font-semibold text-[#1c2421]">Tu acceso</h3>
                    <p className="text-sm text-[#61706a]">La persona responsable de administrar el perfil.</p>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="owner-name" className={labelClass}>Nombre y apellido</label>
                    <div className="relative">
                      <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718078]" aria-hidden="true" />
                      <input id="owner-name" type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} placeholder="Juan Pérez" autoComplete="name" required className={iconInputClass} />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="owner-email" className={labelClass}>Correo electrónico</label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718078]" aria-hidden="true" />
                      <input id="owner-email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="juan@muebleria.com" autoComplete="email" required className={iconInputClass} />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="new-password" className={labelClass}>Contraseña</label>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718078]" aria-hidden="true" />
                      <input id="new-password" type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Mínimo 8 caracteres" autoComplete="new-password" required className={`${iconInputClass} pr-11`} />
                      <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-[#61706a] hover:text-[#1c2421]" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                        {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                      </button>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-[#61706a]">Usá al menos 8 caracteres, una mayúscula, una minúscula y un número.</p>
                  </div>

                  <div>
                    <label htmlFor="confirm-password" className={labelClass}>Confirmar contraseña</label>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718078]" aria-hidden="true" />
                      <input id="confirm-password" type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Repetí la contraseña" autoComplete="new-password" required className={`${iconInputClass} pr-11`} />
                      <button type="button" onClick={() => setShowConfirmPassword((visible) => !visible)} className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-[#61706a] hover:text-[#1c2421]" aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"} title={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <div className="border-t border-[#d9e0dc] pt-6">
                <button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 bg-[#0b6e5e] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#075247] disabled:cursor-not-allowed disabled:bg-[#9aaba3]">
                  {loading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
                  {loading ? "Creando cuenta" : "Crear cuenta"}
                  {!loading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
                </button>
                <p className="mt-4 text-center text-sm text-[#61706a]">
                  ¿Ya tenés una cuenta?{" "}
                  <Link href="/login" className="font-semibold text-[#0b6e5e] hover:text-[#075247]">Iniciá sesión</Link>
                </p>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
