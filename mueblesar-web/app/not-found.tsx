import Link from "next/link";
import { Container } from "./components/layout/Container";

export default function NotFound() {
  return (
    <div className="py-20">
      <Container>
        <div className="max-w-xl space-y-4 rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">404</p>
          <h1 className="text-3xl font-bold text-slate-900">Página no encontrada</h1>
          <p className="text-sm text-slate-700">No pudimos encontrar la página que buscás.</p>
          <div className="flex gap-3">
            <Link href="/productos" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">
              Volver al catálogo
            </Link>
            <Link href="/" className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-primary hover:text-primary">
              Ir al inicio
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
