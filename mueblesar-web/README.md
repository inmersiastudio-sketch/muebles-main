# Amobly web

Aplicacion Next.js para el catalogo publico, autenticacion y panel de
mueblerias.

## Uso local

Crea .env.local con la URL de la API:

~~~text
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_SITE_URL=http://localhost:3000
~~~

Luego inicia el proyecto:

~~~powershell
npm.cmd install
npm.cmd run dev
~~~

La aplicacion se abre en http://localhost:3000.

## Comandos

| Comando | Uso |
| --- | --- |
| npm.cmd run dev | Desarrollo. |
| npm.cmd run lint | Revision estatica. |
| npm.cmd run build | Compilacion de produccion. |
| npm.cmd run test:e2e | Pruebas Playwright. |

La guia de operacion compartida esta en ../docs/OPERACION.md y el alcance de
producto en ../docs/PRODUCTO.md.
