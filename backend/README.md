# Amobly Backend

- `k6 run scripts/k6-load.js` — prueba de carga básica (usa BASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD)
- `npm run dev` — start in watch mode with tsx
- `GET /api/products/:id`
- `GET /api/stores`
- `GET /api/stores/:slug`
Copy `.env.example` to `.env` and adjust:
- `PORT` (default 3001)
- Schema in `prisma/schema.prisma`
- Generate client: `npm run prisma:generate`
- Run migrations once a PostgreSQL database is reachable (example: `npx prisma migrate dev --name init`)
- Seed initial data (stores/products/images): `npm run db:seed`

## Operación
- CDN recomendado: Cloudflare para servir estáticos/GLB con cache agresivo y TLS gratis.
- HTTPS: desplegar detrás de proxy con TLS; el server tiene `trust proxy` y cookies Secure activas en producción.
- Rate limiting: general 120 req/min y eventos 60 req/min; login 10 intentos/15m.  - **Redis required**: set `REDIS_URL` for distributed counters; falls back to in-memory for local dev.- Password policy: mínimo 8 caracteres con mayúscula, minúscula y número.
- Carga: `k6 run scripts/k6-load.js` con thresholds p95<500ms y error rate <1%.
- Auditoría/respaldos: pendiente agregar logs de acciones admin (crear/editar/borrar) y job de backups automáticos con restore verificado.
- Add Prisma schema + migrations for products/stores/images.
- Wire real data and pagination.
- Add Swagger/OpenAPI and generate TS SDK for the frontend.
- Add auth (JWT) for dashboard routes.
