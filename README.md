# Amobly 🛋️✨

Amobly es una plataforma web B2B para que mueblerías publiquen sus catálogos, reciban consultas directamente (por WhatsApp o formulario) y administren sus productos con soporte para **modelos 3D y realidad aumentada (AR)**.

El repositorio es un monorepo que contiene las siguientes aplicaciones:
*   **[backend](file:///c:/Users/Erik/Documents/GitHub/muebles-main/backend/)**: API construida con Node.js (Express), Prisma ORM y PostgreSQL.
*   **[mueblesar-web](file:///c:/Users/Erik/Documents/GitHub/muebles-main/mueblesar-web/)**: Aplicación en Next.js para el catálogo público y el panel de administración de las tiendas.
*   **[docs](file:///c:/Users/Erik/Documents/GitHub/muebles-main/docs/)**: Carpeta con documentación vigente sobre producto, operación y bitácora de cambios.

---

## 🚀 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:
*   **Node.js** (versión 20 o superior).
*   **npm** (incluido con Node).
*   **Base de datos**: Necesitarás **PostgreSQL** para guardar los datos.

---

## 🗄️ Configuración de la Base de Datos (PostgreSQL)

Para levantar PostgreSQL de forma local, puedes elegir una de las siguientes dos opciones:

### Opción A: Usando Docker (Recomendada 🐳)
Docker es la forma más rápida y limpia. Evita tener que instalar PostgreSQL y Redis en tu sistema operativo.
1. Descarga e instala [Docker Desktop](https://www.docker.com/products/docker-desktop/).
2. Desde la raíz de este proyecto, abre una terminal y ejecuta:
   ```bash
   docker compose up -d
   ```
   *Esto levantará automáticamente una base de datos PostgreSQL en el puerto `5432` (con la base `mueblesar`, usuario `postgres`, contraseña `postgres`) y un servidor Redis en el puerto `6379`.*

### Opción B: Instalación Manual
Si no deseas usar Docker, deberás instalar PostgreSQL directamente:
1. Descarga el instalador de [PostgreSQL](https://www.postgresql.org/download/) y ejecútalo.
2. Durante la instalación, configura el usuario `postgres` y la contraseña que desees.
3. Abre tu gestor de base de datos (por ejemplo, **pgAdmin** o **DBeaver**).
4. Crea una nueva base de datos llamada **`mueblesar`**.
5. Asegúrate de actualizar el archivo `.env` del backend con tus credenciales configuradas (ver paso siguiente).

---

## 🔧 Configuración del Entorno de Desarrollo

Sigue estos pasos en orden para configurar y ejecutar el proyecto localmente.

### 1. Variables de Entorno

#### Backend:
Ve a la carpeta **[backend](file:///c:/Users/Erik/Documents/GitHub/muebles-main/backend/)** y crea un archivo llamado `.env` copiando el archivo de ejemplo:
```powershell
cp .env.example .env
```
Abre `.env` y asegúrate de que tenga las configuraciones correctas. Si utilizaste la **Opción A (Docker)**, esta URL de conexión funcionará directamente:
```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mueblesar
JWT_SECRET=dev-secret-change
ADMIN_API_KEY=dev-admin-key
SITE_URL=http://localhost:3000
API_BASE_URL=http://localhost:3001
REDIS_URL=redis://localhost:6379

# Para habilitar correos electrónicos:
RESEND_API_KEY=re_tu_api_key
EMAIL_FROM=Amobly <onboarding@resend.dev>
```

#### Frontend (mueblesar-web):
Ve a la carpeta **[mueblesar-web](file:///c:/Users/Erik/Documents/GitHub/muebles-main/mueblesar-web/)** y crea un archivo llamado `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

### 2. Inicializar el Backend

Abre una terminal en la carpeta `/backend` y ejecuta los siguientes comandos en orden:

```powershell
# 1. Instalar dependencias
npm install

# 2. Generar el cliente de Prisma ORM
npm run prisma:generate

# 3. Aplicar las migraciones a la base de datos
npx prisma migrate dev

# 4. Iniciar el servidor en modo desarrollo con hot reload
npm run dev
```

*El backend se ejecutará en **http://localhost:3001**.*
*Puedes verificar si responde correctamente entrando a **http://localhost:3001/health** (debería responder `{"status":"ok"}`).*

---

### 3. Inicializar el Frontend

Abre una terminal en la carpeta `/mueblesar-web` y ejecuta:

```powershell
# 1. Instalar dependencias
npm install

# 2. Iniciar el servidor Next.js
npm run dev
```

*El frontend se abrirá en **http://localhost:3000**.*

---

## 🛠️ Comandos Útiles

### En `/backend`
*   `npm run build`: Compila el código TypeScript a JavaScript en la carpeta `/dist`.
*   `npm run db:seed`: Vuelve a cargar datos de prueba limpios en la base de datos (tiendas de prueba, usuarios y productos de ejemplo).

### En `/mueblesar-web`
*   `npm run lint`: Ejecuta el análisis estático del código (TypeScript y ESLint) para detectar problemas.
*   `npm run build`: Compila la aplicación Next.js para producción.
*   `npm run test:e2e`: Ejecuta las pruebas de extremo a extremo (E2E) con Playwright.

---

## 📖 Documentación Relacionada
*   **[docs/BITACORA.md](file:///c:/Users/Erik/Documents/GitHub/muebles-main/docs/BITACORA.md)**: Bitácora de cambios y decisiones arquitectónicas.
*   **[docs/OPERACION.md](file:///c:/Users/Erik/Documents/GitHub/muebles-main/docs/OPERACION.md)**: Detalles técnicos sobre el despliegue, validación y flujos operativos.
*   **[docs/PRODUCTO.md](file:///c:/Users/Erik/Documents/GitHub/muebles-main/docs/PRODUCTO.md)**: Alcance comercial y guías para los modelos 3D y AR.
