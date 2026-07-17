# Amobly backend

API Express con Prisma y PostgreSQL para catalogo, autenticacion, consultas,
media y administracion.

## Uso local

1. Crea .env a partir de .env.example y define DATABASE_URL.
2. Instala dependencias, genera el cliente Prisma y ejecuta las migraciones.
3. Levanta el servidor.

~~~powershell
npm.cmd install
npm.cmd run prisma:generate
npx prisma migrate dev
npm.cmd run dev
~~~

El servicio escucha en http://localhost:3001 y responde en /health.

## Comandos

| Comando | Uso |
| --- | --- |
| npm.cmd run dev | Desarrollo con recarga. |
| npm.cmd run build | Genera Prisma y compila TypeScript. |
| npm.cmd run db:seed | Carga datos de ejemplo solo en desarrollo. |
| npm.cmd run db:seed:pilot | Crea o actualiza el piloto 3D sin borrar datos. |
| npm.cmd run validate:glb-scale | Valida escala de un GLB. |

La configuracion de variables, pruebas y despliegue se mantiene en
../docs/OPERACION.md. El alcance de producto y el criterio de 3D estan en
../docs/PRODUCTO.md.
