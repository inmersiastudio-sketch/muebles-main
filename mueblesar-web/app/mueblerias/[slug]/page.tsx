import { redirect } from "next/navigation";

/**
 * Redirección de /mueblerias/[slug] a /catalog/[slug]
 * 
 * Mantenemos esta ruta para:
 * 1. No romper bookmarks de usuarios
 * 2. SEO (los motores de búsqueda indexaron /mueblerias/)
 * 3. Links externos que apuntan a /mueblerias/
 * 
 * La página real del catálogo está en /catalog/[slug]
 */

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function MuebleriaRedirect({ params }: PageProps) {
  const { slug } = await params;
  
  // Redirigir permanentemente (308) a la nueva ruta del catálogo
  redirect(`/catalog/${slug}`);
}
