"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "../components/layout/Container";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al enviar el correo");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError("Error de conexión. Intentá nuevamente.");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
        <Container>
          <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Correo enviado</h1>
            <p className="mt-2 text-sm text-slate-600">
              Si el email existe en nuestro sistema, recibirás un enlace de recuperación en breve.
            </p>
            <p className="mt-4 text-sm text-slate-600">
              Revisá tu bandeja de entrada y seguí las instrucciones.
            </p>
            <div className="mt-6">
              <Button asChild className="w-full">
                <Link href="/admin">Volver al inicio de sesión</Link>
              </Button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <Container>
        <div className="mx-auto max-w-md rounded-2xl bg-white p-8 shadow-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Recuperar contraseña</h1>
            <p className="mt-2 text-sm text-slate-600">
              Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña.
            </p>
          </div>

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Enviando..." : "Enviar enlace de recuperación"}
            </Button>

            <div className="text-center text-sm text-slate-600">
              <Link href="/admin" className="font-semibold text-primary hover:underline">
                Volver al inicio de sesión
              </Link>
            </div>
          </form>
        </div>
      </Container>
    </div>
  );
}
