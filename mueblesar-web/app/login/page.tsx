"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from "lucide-react";
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
  const [notice, setNotice] = useState<string | null>(null);
  const [showVerificationMsg, setShowVerificationMsg] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, { credentials: "include" });
        const data = await res.json();
        if (data.user) {
          router.push("/admin");
          return;
        }
      } catch {
        // The access form remains available when the API is temporarily unreachable.
      }
      setCheckingAuth(false);
    };

    check();
  }, [router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setShowVerificationMsg(false);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message = data.error || data.message || "No pudimos iniciar sesión. Revisá tus datos.";
        const requiresVerification = data.code === "EMAIL_NOT_VERIFIED";
        setShowVerificationMsg(requiresVerification);
        setError(message);
        showError(message);
        return;
      }

      success("Sesión iniciada. Te llevamos al panel.");
      router.push("/admin");
    } catch {
      const message = "No pudimos comunicarnos con el servidor. Intentá nuevamente.";
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setError(null);
    setNotice(null);

    try {
      const res = await fetch(`${API_BASE}/api/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Unable to resend verification email");
      }
      const message = data.message || "Te enviamos un nuevo email de verificación.";
      setNotice(message);
      setShowVerificationMsg(false);
      success(message);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "No se pudo reenviar el email. Intentá más tarde.";
      setError(message);
      showError(message);
    }
  };

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f7f6]">
        <LoaderCircle className="h-6 w-6 animate-spin text-[#0b6e5e]" aria-label="Cargando" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f7f6] text-[#1c2421]">
      <div className="grid min-h-screen lg:grid-cols-[minmax(360px,0.88fr)_minmax(0,1.12fr)]">
        <aside className="relative hidden overflow-hidden bg-[#1c2925] px-10 py-10 lg:flex lg:flex-col xl:px-14">
          <Link href="/" className="inline-flex w-fit items-center gap-2 text-sm font-medium text-white/75 transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Volver al sitio
          </Link>

          <div className="mt-auto">
            <p className="text-sm font-semibold tracking-[0.18em] text-[#e7a86e]">AMOBLY</p>
            <h1 className="mt-4 max-w-sm text-3xl font-semibold leading-tight text-white">
              El espacio de trabajo de tu mueblería.
            </h1>
            <p className="mt-4 max-w-sm text-base leading-7 text-white/70">
              Ingresá para continuar donde lo dejaste.
            </p>
          </div>

          <div className="relative mt-8 h-56 shrink-0 xl:h-64">
            <Image
              src="/sofa-hero.png"
              alt="Sofá de dos cuerpos"
              fill
              priority
              sizes="42vw"
              className="object-contain object-center"
            />
          </div>

        </aside>

        <section className="flex min-h-screen flex-col bg-white px-6 py-6 sm:px-10 lg:px-16 lg:py-10">
          <header className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-[0.08em] text-[#1c2421] lg:hidden">
              <span className="flex h-8 w-8 items-center justify-center bg-[#0b6e5e] text-sm font-bold text-white">A</span>
              AMOBLY
            </Link>
            <span className="hidden text-sm text-[#61706a] lg:block">Panel para mueblerías</span>
            <Link href="/registrar" className="text-sm font-semibold text-[#0b6e5e] transition-colors hover:text-[#075247]">
              Crear una cuenta
            </Link>
          </header>

          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-14 lg:py-8">
            <div className="mb-9">
              <p className="text-sm font-semibold text-[#0b6e5e]">Acceso</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal text-[#1c2421]">Iniciá sesión</h2>
              <p className="mt-3 text-base leading-6 text-[#61706a]">Ingresá con el correo que usaste al registrar tu mueblería.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {notice && (
                <div role="status" className="border-l-4 border-[#0b6e5e] bg-[#edf7f3] px-4 py-3 text-sm leading-5 text-[#075247]">
                  {notice}
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className={`border-l-4 px-4 py-3 text-sm leading-5 ${
                    showVerificationMsg
                      ? "border-[#d97746] bg-[#fff7f2] text-[#80411f]"
                      : "border-[#b63a2b] bg-[#fdf2f1] text-[#80251b]"
                  }`}
                >
                  <p>{error}</p>
                  {showVerificationMsg && (
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      className="mt-2 font-semibold text-[#80411f] underline decoration-[#d97746]/50 underline-offset-4 hover:text-[#5c2e16]"
                    >
                      Reenviar email de verificación
                    </button>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="login-email" className="mb-2 block text-sm font-semibold text-[#34423c]">Correo electrónico</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718078]" aria-hidden="true" />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => { setEmail(event.target.value); setError(null); setNotice(null); }}
                    placeholder="tu@muebleria.com"
                    required
                    className="h-12 w-full border border-[#cbd4cf] bg-white pl-10 pr-4 text-[15px] text-[#1c2421] outline-none transition-colors placeholder:text-[#8a9690] focus:border-[#0b6e5e] focus:ring-2 focus:ring-[#0b6e5e]/15"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label htmlFor="login-password" className="text-sm font-semibold text-[#34423c]">Contraseña</label>
                  <Link href="/recuperar-contrasena" className="text-sm font-semibold text-[#0b6e5e] hover:text-[#075247]">¿Olvidaste tu contraseña?</Link>
                </div>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#718078]" aria-hidden="true" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => { setPassword(event.target.value); setError(null); setNotice(null); }}
                    placeholder="Ingresá tu contraseña"
                    required
                    className="h-12 w-full border border-[#cbd4cf] bg-white pl-10 pr-12 text-[15px] text-[#1c2421] outline-none transition-colors placeholder:text-[#8a9690] focus:border-[#0b6e5e] focus:ring-2 focus:ring-[#0b6e5e]/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-[#61706a] transition-colors hover:text-[#1c2421]"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email.trim() || !password}
                className="mt-2 flex h-12 w-full items-center justify-center gap-2 bg-[#0b6e5e] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#075247] disabled:cursor-not-allowed disabled:bg-[#9aaba3]"
              >
                {loading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                {loading ? "Ingresando" : "Continuar"}
                {!loading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
              </button>
            </form>

            <div className="mt-8 border-t border-[#e1e6e3] pt-6 text-center text-sm text-[#61706a]">
              ¿Todavía no publicás en Amobly?{" "}
              <Link href="/registrar" className="font-semibold text-[#0b6e5e] hover:text-[#075247]">Registrá tu mueblería</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
