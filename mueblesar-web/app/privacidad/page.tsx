import { Container } from "../components/layout/Container";
import Link from "next/link";

export const metadata = {
  title: "Política de Privacidad | Amobly",
  description: "Política de privacidad y protección de datos de Amobly.",
};

export default function PrivacidadPage() {
  return (
    <div className="py-10">
      <Container>
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Legal</p>
            <h1 className="text-3xl font-bold text-slate-900">Política de Privacidad</h1>
            <p className="mt-2 text-sm text-slate-500">Última actualización: Marzo 2026</p>
          </div>

          <div className="prose prose-slate max-w-none space-y-6">
            <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">1. Información que Recopilamos</h2>
              <p className="text-slate-600 leading-relaxed mb-3">
                En Amobly recopilamos la siguiente información:
              </p>
              
              <h3 className="text-lg font-medium text-slate-800 mt-4 mb-2">Datos que proporcionás</h3>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Email y contraseña al registrar una mueblería
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Nombre de la mueblería y datos de contacto
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Información de productos que publicás
                </li>
              </ul>

              <h3 className="text-lg font-medium text-slate-800 mt-4 mb-2">Datos recopilados automáticamente</h3>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Productos vistos y favoritos guardados (en tu dispositivo)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Uso de la función de realidad aumentada
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Información técnica del dispositivo (tipo de navegador, sistema operativo)
                </li>
              </ul>
            </section>

            <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">2. Cómo Usamos tu Información</h2>
              <p className="text-slate-600 leading-relaxed mb-3">
                Utilizamos la información recopilada para:
              </p>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Mostrar productos relevantes en el catálogo
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Facilitar el contacto entre clientes y mueblerías
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Mejorar la experiencia de la plataforma
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Generar estadísticas anónimas de uso
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Prevenir fraudes y usos indebidos
                </li>
              </ul>
            </section>

            <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">3. Almacenamiento Local</h2>
              <p className="text-slate-600 leading-relaxed">
                Amobly utiliza el almacenamiento local de tu navegador (localStorage) para:
              </p>
              <ul className="mt-3 space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <strong>Favoritos:</strong> Los productos que guardás como favoritos se almacenan en tu dispositivo
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <strong>Carrito:</strong> Los productos agregados al carrito se guardan localmente
                </li>
              </ul>
              <p className="text-slate-600 leading-relaxed mt-3">
                Esta información no se envía a nuestros servidores y podés eliminarla 
                limpiando los datos del navegador.
              </p>
            </section>

            <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">4. Compartir Información</h2>
              <p className="text-slate-600 leading-relaxed mb-3">
                <strong>No vendemos tu información personal.</strong> Compartimos datos únicamente con:
              </p>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <strong>Mueblerías:</strong> Cuando contactás vía WhatsApp, ellos reciben tu número
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <strong>Proveedores de servicios:</strong> Cloudinary (imágenes), Railway (hosting), Vercel (frontend)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <strong>Autoridades:</strong> Solo si es legalmente requerido
                </li>
              </ul>
            </section>

            <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">5. Seguridad</h2>
              <p className="text-slate-600 leading-relaxed">
                Implementamos medidas de seguridad para proteger tu información:
              </p>
              <ul className="mt-3 space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Conexiones cifradas (HTTPS/SSL)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Contraseñas hasheadas con algoritmos seguros
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Acceso restringido a datos sensibles
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  Monitoreo de actividades sospechosas
                </li>
              </ul>
            </section>

            <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">6. Tus Derechos</h2>
              <p className="text-slate-600 leading-relaxed mb-3">
                Conforme a la Ley 25.326 de Protección de Datos Personales, tenés derecho a:
              </p>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <strong>Acceso:</strong> Solicitar qué datos tenemos sobre vos
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <strong>Rectificación:</strong> Corregir datos incorrectos
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <strong>Supresión:</strong> Solicitar la eliminación de tus datos
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <strong>Oposición:</strong> Negarte al tratamiento de tus datos
                </li>
              </ul>
              <p className="text-slate-600 leading-relaxed mt-3">
                Para ejercer estos derechos, contactanos a través de nuestra{" "}
                <Link href="/contacto" className="text-primary hover:underline font-medium">
                  página de contacto
                </Link>.
              </p>
            </section>

            <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">7. Cookies</h2>
              <p className="text-slate-600 leading-relaxed">
                Utilizamos cookies esenciales para el funcionamiento de la plataforma. 
                No utilizamos cookies de seguimiento de terceros ni publicidad personalizada.
              </p>
            </section>

            <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">8. Cambios en esta Política</h2>
              <p className="text-slate-600 leading-relaxed">
                Podemos actualizar esta política ocasionalmente. Te notificaremos de cambios 
                significativos publicando la nueva versión en esta página con la fecha de 
                actualización.
              </p>
            </section>

            <section className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">9. Contacto</h2>
              <p className="text-slate-600 leading-relaxed">
                Si tenés preguntas sobre esta política de privacidad, podés contactarnos en 
                nuestra{" "}
                <Link href="/contacto" className="text-primary hover:underline font-medium">
                  página de contacto
                </Link>.
              </p>
            </section>
          </div>

          <div className="mt-8 flex gap-4">
            <Link 
              href="/terminos" 
              className="text-sm font-medium text-primary hover:underline"
            >
              ← Ver Términos y Condiciones
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
