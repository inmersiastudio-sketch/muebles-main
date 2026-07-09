"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Container } from "../components/layout/Container";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Token inválido</h1>
        <p className="mt-2 text-sm text-slate-600">
          El enlace de recuperación no es válido o ha expirado.
        </p>
        <div className="mt-6">
          <Button asChild className="w-full">
            <Link href="/recuperar-contrasena">Solicitar nuevo enlace</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al restablecer la contraseña");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin");
      }, 2000);
    } catch (err) {
      setError("Error de conexión. Intentá nuevamente.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm text-center">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">¡Contraseña actualizada!</h1>
        <p className="mt-2 text-sm text-slate-600">
          Tu contraseña se actualizó correctamente. Redirigiendo al inicio de sesión...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Nueva contraseña</h1>
        <p className="mt-2 text-sm text-slate-600">
          Ingresá tu nueva contraseña.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Nueva contraseña</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            required
          />
          <p className="mt-1 text-xs text-slate-500">
            Debe incluir mayúscula, minúscula y número
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Confirmar contraseña</label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repetí tu contraseña"
            required
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Actualizando..." : "Actualizar contraseña"}
        </Button>

        <div className="text-center text-sm text-slate-600">
          <Link href="/admin" className="font-semibold text-primary hover:underline">
            Volver al inicio de sesión
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function ResetearContrasenaPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <Container>
        <Suspense fallback={
          <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm text-center">
            Cargando...
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </Container>
    </div>
  );
}
