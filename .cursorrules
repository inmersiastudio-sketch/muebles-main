# Reglas del Proyecto Amobly para Agentes de IA 🤖💡

Estas reglas definen el estándar de desarrollo y el flujo de trabajo obligatorio para cualquier Inteligencia Artificial que trabaje en esta base de código.

## 📌 1. Flujo de Git y Ramas (Crítico)
*   **Prohibido programar en `main` o `develop` directamente**: Nunca subas cambios directamente a las ramas de integración principal (`main` o `develop`).
*   **Ramas de Desarrollo**: Cada desarrollador debe crear sus ramas a partir de `develop` usando la convención `dev/nombre-desarrollador/funcionalidad` (ej: `dev/erik/autenticacion`, `dev/nombre-companero/catalog-crash`).
*   **Commits descriptivos**: Los commits deben seguir el formato de Conventional Commits en español (ej: `feat: agregar buscador de tiendas`, `fix: corregir respuesta 403 en endpoints admin`).

## 🗂️ 2. Estructura del Monorepo
*   El proyecto se compone de dos aplicaciones totalmente separadas:
    *   `/backend` (API Express con Prisma ORM y TypeScript)
    *   `/mueblesar-web` (Frontend Next.js en TypeScript)
*   **Gestión de Dependencias**: Nunca instales dependencias en la raíz del proyecto. Si necesitas instalar una librería, ingresa a la carpeta correspondiente (`/backend` o `/mueblesar-web`) y ejecútala ahí.
*   **Separación de Responsabilidades**: No mezcles lógica del backend en el frontend ni viceversa.

## 🗄️ 3. Lógica de Base de Datos (Prisma)
*   Antes de crear o modificar cualquier consulta al backend, revisa el archivo de esquema canon: **[backend/prisma/schema.prisma](file:///c:/Users/Erik/Documents/GitHub/muebles-main/backend/prisma/schema.prisma)** para entender las relaciones y tipos de datos.
*   Si modificas el esquema (`schema.prisma`):
    1.  Ejecuta `npm run prisma:generate` dentro de `/backend` para actualizar el cliente Prisma.
    2.  Ejecuta `npx prisma migrate dev` para crear y aplicar la migración en la base de datos.

## 🎨 4. Estándar de Código y Estilos
*   **Tipado**: Escribe TypeScript estricto. Evita el uso de `any` a menos que sea estrictamente necesario.
*   **Estilos**: El frontend utiliza Tailwind CSS. Mantén la consistencia de estilos usando las variables del tema definidas en **[globals.css](file:///c:/Users/Erik/Documents/GitHub/muebles-main/mueblesar-web/app/globals.css)**.
*   **Idioma**: Comentarios, documentación y mensajes de error orientados al usuario deben escribirse en **español**. Los nombres de funciones, variables y archivos deben estar en **inglés** (camelCase para variables/funciones, PascalCase para componentes, kebab-case para archivos).

## 🔒 5. Seguridad y Variables de Entorno
*   **Secretos**: Nunca versionar archivos `.env` o `.env.local`. Cualquier clave API o contraseña debe leerse exclusivamente de `process.env`.
*   **Endpoints Protegidos**: Todas las rutas de administración del backend en `/api/admin/...` deben requerir autenticación usando los middlewares `requireAuth` y `requireRole`.

## 🧪 6. Proceso de Validación
*   Antes de dar una tarea por completada:
    1.  Verifica que no haya errores de linter en el frontend corriendo `npm run lint` en `/mueblesar-web`.
    2.  Verifica que el código del backend compile sin errores ejecutando `npm run build` en `/backend`.
