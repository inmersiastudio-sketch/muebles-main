# 🚀 GUÍA DE DEPLOYMENT A PRODUCCIÓN - MueblesAR

## ✅ PASO 1: CREAR CUENTA CLOUDINARY (5 minutos)

1. Ve a https://cloudinary.com/users/register_free
2. Regístrate con email (plan gratuito: 25GB storage, 25k transformaciones/mes)
3. En el Dashboard, copia estos valores:
   - **Cloud Name**: ej. `dxy123abc`
   - **API Key**: ej. `123456789012345`
   - **API Secret**: ej. `AbCdEfGhIjKlMnOpQrStUvWxYz`

---

## ✅ PASO 2: CONFIGURAR RAILWAY (10 minutos)

### Backend Environment Variables
Ir a Railway → `mueblesar-backend-production` → Variables:

```bash
# Base
NODE_ENV=production
PORT=3001

# Database (Railway te da esta URL automáticamente)
DATABASE_URL=postgresql://postgres:XXXXX@XXXXX.railway.internal:5432/railway

# JWT (generar clave segura con: openssl rand -base64 32)
JWT_SECRET=TU_CLAVE_SECRETA_AQUI_32_CARACTERES_MINIMO

# Admin (generar clave segura)
ADMIN_API_KEY=TU_ADMIN_KEY_AQUI

# Cloudinary (copiar del paso 1)
CLOUDINARY_CLOUD_NAME=dxy123abc
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=AbCdEfGhIjKlMnOpQrStUvWxYz

# AI 3D Generation (optional - sign up at https://meshy.ai)
MESHY_API_KEY=msy_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Site URL
SITE_URL=https://app.amobly.ar
```

### Frontend Environment Variables (Vercel)
Ir a Vercel → `mueblesar-web` → Settings → Environment Variables:

```bash
NEXT_PUBLIC_API_BASE_URL=https://api.amobly.ar
NEXT_PUBLIC_SITE_URL=https://app.amobly.ar
```

---

## ✅ PASO 3: EJECUTAR MIGRATIONS EN PRODUCCIÓN

### Opción A: Desde Railway Dashboard
1. Railway → `mueblesar-backend-production` → Settings → Deploy
2. Agregar comando de build: `npm run prisma:generate && npm run build`
3. Agregar comando de deploy: `npx prisma migrate deploy && npm start`

### Opción B: Desde tu terminal con DATABASE_URL de producción
```bash
cd backend
# Reemplazar con tu DATABASE_URL real de Railway
DATABASE_URL="postgresql://postgres:XXXXX@XXXXX.railway.app:5432/railway" npx prisma migrate deploy
```

Las migrations que se ejecutarán:
- ✅ Schema inicial (User, Store, Product, etc.)
- ✅ PasswordResetToken
- ✅ Full-text search indexes

---

## ✅ PASO 4: CAMBIAR NAMESERVERS EN DONWEB (5 min + espera)

1. Ir a https://www.donweb.com
2. Login → Panel de Control → Mis Dominios → amobly.ar
3. DNS/Nameservers → Cambiar a:
   - `boyd.ns.cloudflare.com`
   - `haley.ns.cloudflare.com`
4. Guardar cambios

⏰ **Propagación DNS**: 15 minutos a 48 horas (usualmente 1-2 horas)

---

## ✅ PASO 5: VERIFICAR CLOUDFLARE (Ya configurado ✓)

Ya está hecho, pero revisar:
- DNS Records: app.amobly.ar → CNAME cname.vercel-dns.com
- DNS Records: api.amobly.ar → CNAME mueblesar-backend-production.up.railway.app
- SSL/TLS: Full
- Proxy: Activado (nube naranja)

---

## ✅ PASO 6: VERIFICACIÓN POST-DEPLOYMENT

### Cuando DNS propague, verificar:

```bash
# 1. Backend Health Check
curl https://api.amobly.ar/api/products

# 2. Frontend
curl -I https://app.amobly.ar

# 3. SSL válido
curl -I https://app.amobly.ar | grep "HTTP/2 200"

# 4. Cache Cloudflare
curl -I https://app.amobly.ar | grep "cf-cache-status"
```

### Tests funcionales:
1. ✅ Registro de tienda: https://app.amobly.ar/registrar
2. ✅ Login admin: https://app.amobly.ar/admin
3. ✅ Subir imagen de producto (requiere Cloudinary configurado)
4. ✅ Búsqueda full-text
5. ✅ Agregar al carrito → WhatsApp
6. ✅ Recuperar contraseña

---

## 🔥 TROUBLESHOOTING

### Error: "fetch failed" en producción
- Verificar NEXT_PUBLIC_API_BASE_URL en Vercel
- Verificar que api.amobly.ar resuelve correctamente: `nslookup api.amobly.ar`

### Error: Prisma migrations
```bash
# Reset completo (CUIDADO: borra datos)
npx prisma migrate reset

# Re-generar cliente
npx prisma generate
```

### Error 502 Bad Gateway
- Backend no está arrancado en Railway
- Verificar logs: Railway Dashboard → Deployments → Ver logs

### Cloudinary uploads fallan
- Verificar variables: CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET en Railway
- Test manual: `curl https://api.amobly.ar/api/upload/image` (debe dar 401, no 500)

---

## 📊 MONITORING POST-LAUNCH

```bash
# Load test (cuando esté online)
cd backend
BASE_URL=https://api.amobly.ar ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=tu_password k6 run scripts/k6-load.js
```

Métricas esperadas:
- Homepage: <2s
- API /products: <500ms
- Cache HIT ratio: >80%
- Availability: 99.9%

---

## 🎯 CHECKLIST FINAL

- [ ] Cloudinary account creado y configurado
- [ ] Railway env vars actualizadas
- [ ] Vercel env vars actualizadas
- [ ] Migrations ejecutadas en producción
- [ ] Nameservers cambiados en DonWeb
- [ ] DNS propagado (verificar con `nslookup`)
- [ ] HTTPS funcionando en ambos dominios
- [ ] Frontend carga correctamente
- [ ] Backend responde en /api/products
- [ ] Upload de imágenes funciona
- [ ] Registro de tienda funciona
- [ ] Login admin funciona
- [ ] Carrito → WhatsApp funciona
- [ ] Load test ejecutado

---

## 🚨 PRÓXIMOS PASOS DESPUÉS DEL DEPLOYMENT

1. Configurar backups automáticos de DB
2. Configurar alertas de monitoring (UptimeRobot, Better Uptime)
3. Agregar Google Analytics
4. Configurar Sentry para error tracking
5. Implementar sistema de reviews

---

✅ **TODO LISTO?** Ejecutá esta guía paso a paso y avisame si tenés algún problema!
