import { Container } from "../components/layout/Container";
import Link from "next/link";

export const metadata = {
  title: "Términos y Condiciones | Amobly",
  description: "Términos y condiciones de uso de Amobly, el catálogo de mueblerías de Córdoba.",
};

export default function TerminosPage() {
  return (
    <div className="py-14 sm:py-20 bg-[#f9fafb]">
      <Container>
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e7a86e]">Legal</p>
            <h1 className="text-3xl font-bold uppercase tracking-wider text-[#1c2421] mt-2 sm:text-4xl">Términos y Condiciones</h1>
            <p className="mt-3 text-xs text-[#8a9690] uppercase tracking-wider font-semibold">Última actualización: Julio 2026</p>
          </div>

          <div className="bg-white border border-[#e1e6e3] p-6 sm:p-12 space-y-10">
            <section className="border-b border-[#e1e6e3]/60 pb-8">
              <h2 className="text-base font-bold uppercase tracking-wider text-[#1c2421] mb-4">1. Aceptación de los Términos</h2>
              <p className="text-[#61706a] text-sm leading-relaxed">
                Al acceder y utilizar Amobly (&quot;la Plataforma&quot;), aceptás estos términos y condiciones en su totalidad. 
                Si no estás de acuerdo con alguna parte de estos términos, no deberías usar la Plataforma.
              </p>
            </section>

            <section className="border-b border-[#e1e6e3]/60 pb-8">
              <h2 className="text-base font-bold uppercase tracking-wider text-[#1c2421] mb-4">2. Descripción del Servicio</h2>
              <p className="text-[#61706a] text-sm leading-relaxed">
                Amobly es un catálogo digital que conecta mueblerías de Córdoba con clientes finales. 
                La Plataforma permite:
              </p>
              <ul className="mt-4 space-y-3 text-sm text-[#61706a]">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0b6e5e] font-bold">•</span>
                  Explorar productos de diferentes mueblerías de Córdoba.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0b6e5e] font-bold">•</span>
                  Visualizar muebles en 3D y realidad aumentada (AR).
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0b6e5e] font-bold">•</span>
                  Contactar directamente con las mueblerías aliadas vía WhatsApp para consultas.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0b6e5e] font-bold">•</span>
                  Guardar tus productos favoritos en el almacenamiento local de tu dispositivo.
                </li>
              </ul>
            </section>

            <section className="border-b border-[#e1e6e3]/60 pb-8">
              <h2 className="text-base font-bold uppercase tracking-wider text-[#1c2421] mb-4">3. Relación con las Mueblerías</h2>
              <p className="text-[#61706a] text-sm leading-relaxed">
                Amobly actúa únicamente como intermediario informativo y visual entre las mueblerías y los clientes.
                Cualquier transacción de compra, presupuesto o acuerdo de envío se realiza directamente con cada mueblería, quienes son
                plenamente responsables de:
              </p>
              <ul className="mt-4 space-y-3 text-sm text-[#61706a]">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0b6e5e] font-bold">•</span>
                  La veracidad y actualización de la información de sus productos.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0b6e5e] font-bold">•</span>
                  Los precios, condiciones de financiación y disponibilidad.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0b6e5e] font-bold">•</span>
                  La entrega, fletes y garantías de los muebles vendidos.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0b6e5e] font-bold">•</span>
                  La atención al cliente post-venta y devoluciones.
                </li>
              </ul>
            </section>

            <section className="border-b border-[#e1e6e3]/60 pb-8">
              <h2 className="text-base font-bold uppercase tracking-wider text-[#1c2421] mb-4">4. Uso de la Plataforma</h2>
              <p className="text-[#61706a] text-sm leading-relaxed mb-4">
                Al usar Amobly, te comprometés a:
              </p>
              <ul className="space-y-3 text-sm text-[#61706a]">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0b6e5e] font-bold">•</span>
                  Proporcionar datos veraces de contacto cuando inicies una consulta con un comercio.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0b6e5e] font-bold">•</span>
                  No utilizar la Plataforma ni sus recursos para fines fraudulentos o ilegales.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0b6e5e] font-bold">•</span>
                  No intentar vulnerar las medidas de seguridad del sistema.
                </li>
              </ul>
            </section>

            <section className="border-b border-[#e1e6e3]/60 pb-8">
              <h2 className="text-base font-bold uppercase tracking-wider text-[#1c2421] mb-4">5. Propiedad Intelectual</h2>
              <p className="text-[#61706a] text-sm leading-relaxed">
                El diseño de la Plataforma, su software, logos, interfaz y textos de presentación son propiedad intelectual de
                Amobly. Las imágenes de catálogo y descripciones pertenecen a cada comercio aliado respectivo.
              </p>
            </section>

            <section className="border-b border-[#e1e6e3]/60 pb-8">
              <h2 className="text-base font-bold uppercase tracking-wider text-[#1c2421] mb-4">6. Limitación de Responsabilidad</h2>
              <p className="text-[#61706a] text-sm leading-relaxed">
                Amobly no es parte de los contratos de compraventa y no se hace responsable por:
              </p>
              <ul className="mt-4 space-y-3 text-sm text-[#61706a]">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0b6e5e] font-bold">•</span>
                  Disputas comerciales entre clientes y comercios.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0b6e5e] font-bold">•</span>
                  Falta de stock, demoras en la entrega de mercadería o fallas de fabricación.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0b6e5e] font-bold">•</span>
                  Sutiles discrepancias de color o proporciones entre los modelos 3D AR y el producto real entregado.
                </li>
              </ul>
            </section>

            <section className="border-b border-[#e1e6e3]/60 pb-8">
              <h2 className="text-base font-bold uppercase tracking-wider text-[#1c2421] mb-4">7. Modificaciones</h2>
              <p className="text-[#61706a] text-sm leading-relaxed">
                Nos reservamos el derecho de modificar estos términos en cualquier momento. El uso continuado
                de Amobly tras la publicación de los nuevos términos constituye la aceptación de los mismos.
              </p>
            </section>

            <section className="border-b border-[#e1e6e3]/60 pb-8">
              <h2 className="text-base font-bold uppercase tracking-wider text-[#1c2421] mb-4">8. Contacto</h2>
              <p className="text-[#61706a] text-sm leading-relaxed">
                Para cualquier consulta referida a estos términos y condiciones de uso, podés escribirnos en nuestra{" "}
                <Link href="/contacto" className="text-[#0b6e5e] hover:underline font-bold">
                  página de contacto
                </Link>.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold uppercase tracking-wider text-[#1c2421] mb-4">9. Ley Aplicable</h2>
              <p className="text-[#61706a] text-sm leading-relaxed">
                Estos términos se rigen e interpretan bajo las leyes vigentes en la República Argentina.
                Cualquier reclamo o disputa legal se resolverá bajo la jurisdicción de los tribunales ordinarios de la Ciudad de Córdoba.
              </p>
            </section>
          </div>

          <div className="mt-8 flex gap-4">
            <Link 
              href="/privacidad" 
              className="text-xs font-bold uppercase tracking-wider text-[#0b6e5e] hover:underline"
            >
              Ver Política de Privacidad →
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
