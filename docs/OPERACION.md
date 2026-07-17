# Operacion

Esta guia describe el estado operativo actual del repositorio. No contiene
secretos: las claves solo viven en archivos .env no versionados o en el gestor
de variables del entorno de despliegue.

## Requisitos

- Node.js 20 o superior.
- PostgreSQL disponible para el backend.
- npm.
- Credenciales de servicios externos solo cuando se use esa capacidad.

## Configuracion local

### Backend

Crea backend/.env a partir de backend/.env.example. Para una sesion local
funcional se necesitan como minimo:

| Variable | Uso |
| --- | --- |
| DATABASE_URL | Conexion de Prisma a PostgreSQL. |
| JWT_SECRET | Sesion autenticada. |
| ADMIN_API_KEY | Rutas administrativas protegidas. |
| SITE_URL | URL del frontend, normalmente http://localhost:3000. |
| API_BASE_URL | URL de la API, normalmente http://localhost:3001. |

Cloudinary, AWS para modelos 3D, Mercado Pago, Photoroom y proveedores 3D son
integraciones opcionales. RESEND_API_KEY y EMAIL_FROM son obligatorias para
registro, verificacion de correo y recuperacion de contrasena. REDIS_URL es
opcional en local.

~~~powershell
Set-Location backend
npm.cmd install
npm.cmd run prisma:generate
npx prisma migrate dev
npm.cmd run db:seed
npm.cmd run dev
~~~

El seed es solo para desarrollo. No lo ejecutes en produccion: carga datos de
demostracion y no es un procedimiento de alta de datos productivos. Tampoco
dependas del auto-seed en una base de produccion.

### Catalogo piloto para pruebas 3D/AR

Existe un seed separado, idempotente y no destructivo que crea la muebleria
`Estudio Nativo · Piloto Amobly` y el producto completo `Sofa Nativo Boucle`.
Incluye un GLB procedural a escala real (2,00 x 0,90 x 0,80 m), medidas de
embalaje (2,05 x 0,95 x 0,85 m), precio, stock, variante, materiales,
garantia y logistica. No consume creditos de generacion 3D.

Antes de ejecutarlo en el entorno elegido, configura las URLs publicas. Las
variables de contacto y acceso son opcionales; si no se define una contrasena,
el usuario piloto se crea con una clave aleatoria no comunicada y no se puede
usar para iniciar sesion.

~~~text
SITE_URL=https://www.tu-frontend.com
API_BASE_URL=https://api.tu-dominio.com
PILOT_STORE_PASSWORD=una-clave-segura-opcional
PILOT_STORE_WHATSAPP=5493510000000
PILOT_STORE_PHONE=+54 9 351 000-0000
PILOT_PRODUCT_IMAGE_URL=https://cdn.tu-dominio.com/sofa-piloto.png
~~~

~~~powershell
Set-Location backend
npm.cmd run db:seed:pilot
~~~

El comando puede repetirse después de un despliegue: actualiza únicamente los
registros con los slugs/SKU del piloto y sus medios, sin limpiar otras tiendas
o productos. `PILOT_PRODUCT_IMAGE_URL` puede omitirse si el frontend sirve el
asset incluido en `/images/examples/sofa-boucle-roble-ai.png`.

El registro de una muebleria necesita PostgreSQL activo. Si la base no esta
disponible, el formulario llega a la API pero no puede completar el alta.

### Frontend

Crea mueblesar-web/.env.local:

~~~text
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000
~~~

Luego:

~~~powershell
Set-Location mueblesar-web
npm.cmd install
npm.cmd run dev
~~~

NEXT_PUBLIC_API_BASE_URL es obligatoria al compilar. NEXT_PUBLIC_SITE_URL define
metadata, sitemap y enlaces compartidos.

## Validacion

| Area | Comando |
| --- | --- |
| Backend | npm.cmd run build |
| Frontend, lint | npm.cmd run lint |
| Frontend, build | npm.cmd run build |
| E2E frontend | npm.cmd run test:e2e |
| Salud de la API | GET http://localhost:3001/health |

El script lint del backend es actualmente un placeholder. El lint del frontend
puede reportar advertencias heredadas; los errores nuevos deben resolverse antes
de publicar.

## Despliegue

No hay un proveedor de hosting obligatorio ni infraestructura de despliegue
versionada en este repositorio. El frontend y la API se pueden desplegar por
separado si sus URLs y cookies son coherentes.

Variables obligatorias de produccion:

| Variable | Motivo |
| --- | --- |
| DATABASE_URL | Base de datos productiva. |
| NODE_ENV=production | Activa protecciones de produccion. |
| JWT_SECRET y ADMIN_API_KEY | Deben ser secretos y no predecibles. |
| REDIS_URL | Requerida para rate limiting distribuido. |
| SITE_URL y API_BASE_URL | URLs publicas de frontend y API. |
| FRONTEND_URL | Allowlist real de CORS; admite varias URLs separadas por coma. |
| NEXT_PUBLIC_API_BASE_URL | API que consumira la compilacion del frontend. |
| NEXT_PUBLIC_SITE_URL | Dominio publico usado por el frontend. |

Integraciones condicionales: Cloudinary para media, AWS para modelos, Resend
para envio real de correos, Mercado Pago y su token de webhook para cobros,
Photoroom y proveedores de generacion 3D. Sin Resend los correos se registran
en logs; sin token valido los webhooks de pagos no deben aceptarse.

Antes de publicar:

1. Confirma que las migraciones necesarias estan versionadas.
2. Desde backend, ejecuta npx prisma migrate deploy.
3. Configura HTTPS, CORS y cookies, y prueba login, registro y recuperacion.
4. Verifica GET /health, catalogo, consultas y el panel desde un telefono.
5. Rota cualquier secreto que haya sido compartido o incluido por error en
   documentos historicos.
6. No habilites modelos 3D generados para AR hasta completar sus controles de
   calidad.

Cloudinary tiene un limite practico de 10 MB para GLB en el plan gratuito. Para
modelos mas pesados se necesita optimizacion real o almacenamiento alternativo.
