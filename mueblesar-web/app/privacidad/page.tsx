import { Container } from "../components/layout/Container";
import Link from "next/link";

export const metadata = {
  title: "Política de Privacidad | Amobly",
  description: "Política de privacidad y protección de datos de Amobly.",
};

export default function PrivacidadPage() {
  return (
    <div className="py-14 sm:py-20 bg-[#f9fafb]">
      <Container>
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e7a86e]">Legal</p>
            <h1 className="text-3xl font-bold uppercase tracking-wider text-[#1c2421] mt-2 sm:text-4xl">Política de Privacidad</h1>
            <p className="mt-3 text-xs text-[#8a9690] uppercase tracking-wider font-semibold">Última actualización: Julio 2026</p>
          </div>

          <div className="bg-white border border-[#e1e6e3] p-6 sm:p-12 space-y-10">
            <section className="border-b border-[#e1e6e3]/60 pb-8">
              <h2 className="text-base font-bold uppercase tracking-wider text-[#1c2421] mb-4">1. Información que Recopilamos</h2>
              <p className="text-[#61706a] text-sm leading-relaxed mb-4">
                En Amobly recopilamos la siguiente información:
              </p>
              
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1c2421] mt-6 mb-3">Datos que proporcionás</h3>
              <ul className="space-y-3 text-sm text-[#61706a]">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0b6e5e] font-bold">•</span>
                  Email y contraseña al registrar una mueblería.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0b6e5e] font-bold">•</span>
                  Nombre de la mueblería y datos de contacto.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0b6e5e] font-bold">•</span>
                  Información de productos que publicás en tu catálogo.
                </li>
              </ul>

              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1c2421] mt-6 mb-3">Datos recopilados automáticamente</h3>
              <ul className="space-y-3 text-sm text-[#61706a]">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0b6e5e] font-bold">•</span>
                  Productos vistos y favoritos guardados (exclusivamente en tu dispositivo).
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0b6e5e] font-bold">•</span>
                  Uso de la función de visualización 3D y realidad aumentada.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0b6e5e] font-bold">•</span>
                  Información técnica del dispositivo (tipo de navegador, sistema operativo).
                </li>
              </ul>
            </section>

            <section className="border-b border-[#e1e6e3]/60 pb-8">
              <h2 className="text-base font-bold uppercase tracking-wider text-[#1c2421] mb-4">2. Cómo Usamos tu Información</h2>
              <p className="text-[#61706a] text-sm leading-relaxed mb-4">
                Utilizamos la información recopilada para:
              </p>
              <ul className="space-y-3 text-sm text-[#61706a]">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0b6e5e] font-bold">•</span>
                  Mostrar productos relevantes en el catálogo.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0b6e5e] font-bold">•</span>
                  Facilitar el enlace directo de consultas vía WhatsApp y email entre clientes y comercios.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0b6e5e] font-bold">•</span>
                  Mejorar la experiencia y la optimización de los modelos 3D en la plataforma.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0b6e5e] font-bold">•</span>
                  Generar estadísticas anónimas de uso técnico.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0b6e5e] font-bold">•</span>
                  Prevenir fraudes y usos indebidos de la marca.
                </li>
              </ul>
            </section>

            <section className="border-b border-[#e1e6e3]/60 pb-8">
              <h2 className="text-base font-bold uppercase tracking-wider text-[#1c2421] mb-4">3. Almacenamiento Local</h2>
              <p className="text-[#61706a] text-sm leading-relaxed">
                Amobly utiliza únicamente el almacenamiento local de tu navegador (localStorage) para:
              </p>
              <ul className="mt-4 space-y-3 text-sm text-[#61706a]">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0b6e5e] font-bold">•</span>
                  <span><strong>Favoritos:</strong> Los productos marcados con me gusta se guardan exclusivamente en tu dispositivo para navegación sin necesidad de cuenta de cliente.</span>
                </li>
              </ul>
              <p className="text-[#61706a] text-sm leading-relaxed mt-4">
                Esta información no se envía a nuestros servidores y podés eliminarla por completo
                limpiando los datos de navegación de tu explorador.
              </p>
            </section>

            <section className="border-b border-[#e1e6e3]/60 pb-8">
              <h2 className="text-base font-bold uppercase tracking-wider text-[#1c2421] mb-4">4. Compartir Información</h2>
              <p className="text-[#61706a] text-sm leading-relaxed mb-4">
                <strong>No comercializamos tus datos personales.</strong> Compartimos información únicamente con:
              </p>
              <ul className="space-y-3 text-sm text-[#61706a]">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0b6e5e] font-bold">•</span>
                  <span><strong>Mueblerías:</strong> Al hacer click en &quot;Consultar por WhatsApp&quot;, iniciás un chat directo con el comercio. Amobly no intermedia el chat ni guarda historial de tus mensajes.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0b6e5e] font-bold">•</span>
                  <strong>Proveedores técnicos:</strong> Servicios de hosting, almacenamiento de imágenes y base de datos (Cloudinary, Railway, Vercel).
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0b6e5e] font-bold">•</span>
                  <strong>Autoridades legales:</strong> Solo si es formalmente requerido por orden judicial.
                </li>
              </ul>
            </section>

            <section className="border-b border-[#e1e6e3]/60 pb-8">
              <h2 className="text-base font-bold uppercase tracking-wider text-[#1c2421] mb-4">5. Seguridad de Datos</h2>
              <p className="text-[#61706a] text-sm leading-relaxed">
                Implementamos estándares de seguridad para proteger tu información:
              </p>
              <ul className="mt-4 space-y-3 text-sm text-[#61706a]">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0b6e5e] font-bold">•</span>
                  Conexiones cifradas mediante protocolo HTTPS/SSL.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0b6e5e] font-bold">•</span>
                  Contraseñas de comercios encriptadas utilizando algoritmos de hashing seguro.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0b6e5e] font-bold">•</span>
                  Acceso restringido y autenticación de seguridad en la administración.
                </li>
              </ul>
            </section>

            <section className="border-b border-[#e1e6e3]/60 pb-8">
              <h2 className="text-base font-bold uppercase tracking-wider text-[#1c2421] mb-4">6. Tus Derechos</h2>
              <p className="text-[#61706a] text-sm leading-relaxed mb-4">
                Conforme a la Ley 25.326 de Protección de Datos Personales, tenés derecho a:
              </p>
              <ul className="space-y-3 text-sm text-[#61706a]">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0b6e5e] font-bold">•</span>
                  <strong>Acceso:</strong> Consultar qué información poseemos de tu comercio.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0b6e5e] font-bold">•</span>
                  <strong>Rectificación:</strong> Solicitar la corrección de datos inexactos.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#0b6e5e] font-bold">•</span>
                  <strong>Supresión:</strong> Solicitar la eliminación de tu catálogo y cuenta.
                </li>
              </ul>
              <p className="text-[#61706a] text-sm leading-relaxed mt-4">
                Para ejercer estos derechos, podés contactarte enviando un mensaje directo en nuestra{" "}
                <Link href="/contacto" className="text-[#0b6e5e] hover:underline font-bold">
                  página de contacto
                </Link>.
              </p>
            </section>

            <section className="border-b border-[#e1e6e3]/60 pb-8">
              <h2 className="text-base font-bold uppercase tracking-wider text-[#1c2421] mb-4">7. Cookies</h2>
              <p className="text-[#61706a] text-sm leading-relaxed">
                Utilizamos únicamente cookies técnicas esenciales para la persistencia de sesión de las mueblerías autenticadas.
                No usamos cookies de seguimiento publicitario ni perfiles comerciales de terceros.
              </p>
            </section>

            <section className="border-b border-[#e1e6e3]/60 pb-8">
              <h2 className="text-base font-bold uppercase tracking-wider text-[#1c2421] mb-4">8. Cambios en la Política</h2>
              <p className="text-[#61706a] text-sm leading-relaxed">
                Podemos actualizar estas cláusulas periódicamente. Publicaremos cualquier cambio
                en esta misma sección indicando la fecha de última revisión.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold uppercase tracking-wider text-[#1c2421] mb-4">9. Contacto</h2>
              <p className="text-[#61706a] text-sm leading-relaxed">
                Si tenés dudas sobre el tratamiento de tus datos, consultanos a través de nuestra{" "}
                <Link href="/contacto" className="text-[#0b6e5e] hover:underline font-bold">
                  página de contacto
                </Link>.
              </p>
            </section>
          </div>

          <div className="mt-8 flex gap-4">
            <Link 
              href="/terminos" 
              className="text-xs font-bold uppercase tracking-wider text-[#0b6e5e] hover:underline"
            >
              ← Ver Términos y Condiciones
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
