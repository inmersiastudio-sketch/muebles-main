import { Container } from "../components/layout/Container";
import { FavoritesView } from "../components/favorites/FavoritesView";

export default function FavoritesPage() {
  return (
    <div className="py-10">
      <Container>
        <div className="flex flex-col gap-2 pb-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Favoritos</p>
          <h1 className="text-3xl font-bold text-slate-900">Tus productos guardados</h1>
          <p className="text-sm text-slate-600">Guardamos tus favoritos en este dispositivo.</p>
        </div>

        <FavoritesView />
      </Container>
    </div>
  );
}
