"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Container } from "../components/layout/Container";
import { Button } from "../components/ui/Button";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

function VerificarEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const verified = searchParams.get("verified");
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    // If backend redirected with ?verified=1, show success immediately
    const initialStatus = verified === "1" ? "success" : token ? "verifying" : "pending";
    const [status, setStatus] = useState<"pending" | "verifying" | "success" | "error">(initialStatus);
    const [message, setMessage] = useState(verified === "1" ? "¡Email verificado exitosamente!" : "");
    const [resending, setResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    // If token is present (legacy fallback), verify it via GET which will redirect
    useEffect(() => {
        if (!token || verified === "1") return;

        const verify = async () => {
            try {
                // Navigating to the backend URL will trigger a redirect back here with ?verified=1
                window.location.href = `${API_BASE}/api/auth/verify-email?token=${token}`;
            } catch {
                setStatus("error");
                setMessage("Error de conexión. Intentá nuevamente.");
            }
        };

        verify();
    }, [token, verified]);

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
        return () => clearInterval(timer);
    }, [resendCooldown]);

    const handleResend = async () => {
        if (!email || resending || resendCooldown > 0) return;
        setResending(true);

        try {
            const res = await fetch(`${API_BASE}/api/auth/resend-verification`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setMessage("Email de verificación reenviado. Revisá tu bandeja de entrada.");
                setResendCooldown(60); // 60 second cooldown
            } else {
                setMessage("No se pudo reenviar. Intentá más tarde.");
            }
        } catch {
            setMessage("Error de conexión.");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
            <Container>
                <div className="mx-auto max-w-md text-center">
                    {/* Pending - waiting for user to check email */}
                    {status === "pending" && (
                        <div className="rounded-2xl bg-white p-8 shadow-sm">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                                <svg className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                </svg>
                            </div>

                            <h1 className="text-2xl font-bold text-slate-900 mb-2">Verificá tu email</h1>
                            <p className="text-slate-600 mb-2">
                                Enviamos un enlace de verificación a:
                            </p>
                            {email && (
                                <p className="font-semibold text-blue-600 mb-6">{email}</p>
                            )}
                            <p className="text-sm text-slate-500 mb-6">
                                Hacé click en el enlace del email para activar tu cuenta. Si no lo ves, revisá la carpeta de spam.
                            </p>

                            {message && (
                                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                                    {message}
                                </div>
                            )}

                            <div className="space-y-3">
                                <Button
                                    onClick={handleResend}
                                    disabled={resending || resendCooldown > 0 || !email}
                                    variant="outline"
                                    className="w-full"
                                >
                                    {resending
                                        ? "Reenviando..."
                                        : resendCooldown > 0
                                            ? `Reenviar en ${resendCooldown}s`
                                            : "Reenviar email de verificación"}
                                </Button>

                                <p className="text-xs text-slate-400">
                                    ¿Email incorrecto?{" "}
                                    <Link href="/registrar" className="text-blue-600 hover:underline">
                                        Registrate de nuevo
                                    </Link>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Verifying - processing token */}
                    {status === "verifying" && (
                        <div className="rounded-2xl bg-white p-8 shadow-sm">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 animate-pulse">
                                <svg className="h-10 w-10 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 mb-2">Verificando...</h1>
                            <p className="text-slate-600">Estamos verificando tu email. Un momento...</p>
                        </div>
                    )}

                    {/* Success */}
                    {status === "success" && (
                        <div className="rounded-2xl bg-white p-8 shadow-sm">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                                <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 mb-2">¡Email verificado! 🎉</h1>
                            <p className="text-slate-600 mb-6">{message}</p>
                            <Button onClick={() => router.push("/login")} className="w-full">
                                Iniciar sesión
                            </Button>
                        </div>
                    )}

                    {/* Error */}
                    {status === "error" && (
                        <div className="rounded-2xl bg-white p-8 shadow-sm">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
                                <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 mb-2">Error de verificación</h1>
                            <p className="text-red-600 mb-6">{message}</p>
                            <div className="space-y-3">
                                <Button onClick={() => router.push("/registrar")} className="w-full">
                                    Volver a registrarse
                                </Button>
                                <Link href="/admin" className="block text-sm text-blue-600 hover:underline">
                                    Ir al inicio de sesión
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
}

export default function VerificarEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <p className="text-slate-500">Cargando...</p>
            </div>
        }>
            <VerificarEmailContent />
        </Suspense>
    );
}
