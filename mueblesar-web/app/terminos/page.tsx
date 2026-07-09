import { Container } from "../components/layout/Container";
import Link from "next/link";

export const metadata = {
  title: "Términos y Condiciones | Amobly",
  description: "Términos y condiciones de uso de Amobly, el catálogo de mueblerías de Córdoba.",
};

export default function TerminosPage() {
  return (
    <div className="py-10">
      <Container>
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Legal</p>
            <h1 className="text-3xl font-bold text-slate-900">Términos y Condiciones</h1>
            <p className="mt-2 text-sm text-slate-500">Última actualización: Marzo 2026</p>
          </div>

          <div className="prose prose-slate max-w-none space-y-6">
            <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">1. Aceptación de los Términos</h2>
              <p className="text-slate-600 leading-relaxed">
                Al acceder y utilizar Amobly (&quot;la Plataforma&quot;), aceptás estos términos y condiciones en su totalidad. 
                Si no estás de acuerdo con alguna parte de estos términos, no deberías usar la Plataforma.
              </p>
            </section>

            <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">2. Descripción del Servicio</h2>
              <p className="text-slate-600 leading-relaxed">
                Amobly es un catálogo digital que conecta mueblerías de Córdoba con clientes finales. 
                La Plataforma permite:
              </p>
              <ul className="mt-3 space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Explorar productos de diferentes mueblerías
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Visualizar muebles en realidad aumentada (AR)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Contactar directamente con las mueblerías vía WhatsApp
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Guardar productos favoritos
                </li>
              </ul>
            </section>

            <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">3. Relación con las Mueblerías</h2>
              <p className="text-slate-600 leading-relaxed">
                Amobly actúa únicamente como intermediario entre las mueblerías y los clientes. 
                Las transacciones de compra se realizan directamente con cada mueblería, quienes son 
                responsables de:
              </p>
              <ul className="mt-3 space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  La veracidad de la información de sus productos
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Los precios, disponibilidad y condiciones de venta
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  La entrega y garantía de los productos
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  La atención al cliente post-venta
                </li>
              </ul>
            </section>

            <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">4. Uso de la Plataforma</h2>
              <p className="text-slate-600 leading-relaxed mb-3">
                Al usar Amobly, te comprometés a:
              </p>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Proporcionar información veraz al contactar mueblerías
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  No utilizar la Plataforma para fines ilegales
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  No intentar acceder a áreas restringidas del sistema
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Respetar los derechos de propiedad intelectual
                </li>
              </ul>
            </section>

            <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">5. Propiedad Intelectual</h2>
              <p className="text-slate-600 leading-relaxed">
                Todo el contenido de la Plataforma (diseño, código, logos, textos) es propiedad de 
                Amobly o sus licenciantes. Las imágenes y descripciones de productos pertenecen a 
                cada mueblería respectiva.
              </p>
            </section>

            <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">6. Limitación de Responsabilidad</h2>
              <p className="text-slate-600 leading-relaxed">
                Amobly no se hace responsable por:
              </p>
              <ul className="mt-3 space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Disputas entre clientes y mueblerías
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Inexactitudes en la información de productos
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Interrupciones temporales del servicio
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Diferencias entre modelos AR y productos reales
                </li>
              </ul>
            </section>

            <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">7. Modificaciones</h2>
              <p className="text-slate-600 leading-relaxed">
                Nos reservamos el derecho de modificar estos términos en cualquier momento. 
                Los cambios serán efectivos desde su publicación en la Plataforma. 
                El uso continuado implica la aceptación de los nuevos términos.
              </p>
            </section>

            <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">8. Contacto</h2>
              <p className="text-slate-600 leading-relaxed">
                Para consultas sobre estos términos, contactanos a través de nuestra{" "}
                <Link href="/contacto" className="text-primary hover:underline font-medium">
                  página de contacto
                </Link>.
              </p>
            </section>

            <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">9. Ley Aplicable</h2>
              <p className="text-slate-600 leading-relaxed">
                Estos términos se rigen por las leyes de la República Argentina. 
                Cualquier disputa será sometida a la jurisdicción de los tribunales 
                ordinarios de la Ciudad de Córdoba.
              </p>
            </section>
          </div>

          <div className="mt-8 flex gap-4">
            <Link 
              href="/privacidad" 
              className="text-sm font-medium text-primary hover:underline"
            >
              Ver Política de Privacidad →
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
