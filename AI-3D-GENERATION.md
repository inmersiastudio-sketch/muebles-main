# 🤖 AI 3D Model Generation - Setup Guide

## Overview

La plataforma ahora incluye **generación automática de modelos 3D desde imágenes** usando IA (Meshy.ai).

### Características
- ✅ Convierte fotos de muebles en modelos GLB listos para AR
- ✅ Validación automática de escala
- ✅ Upload automático a Cloudinary
- ✅ Actualización automática del producto
- ✅ Tiempo de generación: 1-3 minutos
- ✅ Costo aproximado: $0.30-2 USD por modelo

---

## 🔧 Setup Meshy.ai

### 1. Crear cuenta en Meshy

Visita: https://meshy.ai

- Regístrate con tu email
- Verifica tu cuenta
- Accede al dashboard

### 2. Obtener API Key

1. Ve a: https://app.meshy.ai/api-keys
2. Click en "Create API Key"
3. Dale un nombre (ej: "MueblesAR Production")
4. Copia la API Key (empieza con `msy_...`)

### 3. Configurar variables de entorno

#### Backend (Local Development)

Agrega a `backend/.env`:

```bash
MESHY_API_KEY=msy_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Backend (Production - Railway)

Railway Dashboard → Variables → Add:

```
MESHY_API_KEY=msy_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 💰 Pricing

Meshy ofrece diferentes planes:

| Plan | Precio | Créditos/mes | Costo por modelo |
|---|---|---|---|
| **Free** | $0 | 200 créditos | ~20 modelos gratis |
| **Starter** | $16/mes | 2,000 créditos | ~200 modelos |
| **Pro** | $48/mes | 7,000 créditos | ~700 modelos |
| **Enterprise** | Custom | Unlimited | Contactar ventas |

**Recomendación**: Empezar con plan Free para testing, luego Starter para producción inicial.

Más info: https://meshy.ai/pricing

---

## 🎯 Cómo usar

### Desde el Admin Panel

1. **Login** en `/admin`
2. **Edita un producto existente** (debe tener ID)
3. Scroll hasta la sección **"🤖 AI 3D Model Generation"**
4. Ingresa la URL de una imagen del producto:
   - Preferiblemente fondo blanco
   - Buena iluminación
   - Vista frontal o 3/4
5. Click **"Generate 3D Model"**
6. Espera 1-3 minutos (el status se actualiza automáticamente)
7. Cuando termine, el modelo GLB se asignará automáticamente al producto

### Vía API (para integraciones custom)

```bash
# Iniciar generación
curl -X POST https://api.amobly.ar/api/admin/ai-3d/generate \
  -H "Content-Type: application/json" \
  -H "Cookie: session=xxx" \
  -d '{
    "productId": 123,
    "imageUrl": "https://example.com/chair.jpg"
  }'

# Respuesta:
# {
#   "success": true,
#   "jobId": 456,
#   "taskId": "meshy-task-abc123",
#   "message": "3D generation started..."
# }

# Chequear status
curl https://api.amobly.ar/api/admin/ai-3d/jobs/456/status \
  -H "Cookie: session=xxx"

# Respuesta (en progreso):
# {
#   "id": 456,
#   "productId": 123,
#   "status": "IN_PROGRESS",
#   "progress": 45
# }

# Respuesta (completado):
# {
#   "id": 456,
#   "productId": 123,
#   "status": "SUCCEEDED",
#   "glbUrl": "https://res.cloudinary.com/xxx/models/generated-abc.glb",
#   "progress": 100
# }
```

---

## 📊 Database Schema

El modelo `AI3DJob` trackea todas las generaciones:

```prisma
model AI3DJob {
  id          Int            @id @default(autoincrement())
  productId   Int
  imageUrl    String
  provider    String         @default("meshy")
  taskId      String?        // Meshy task ID
  status      AI3DJobStatus  // PENDING, IN_PROGRESS, SUCCEEDED, FAILED
  glbUrl      String?        // URL final del modelo (Cloudinary)
  errorMsg    String?
  metadata    Json?
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
}

enum AI3DJobStatus {
  PENDING
  IN_PROGRESS
  SUCCEEDED
  FAILED
}
```

---

## 🚨 Troubleshooting

### Error: "MESHY_API_KEY not configured"

- Verifica que la variable esté en `.env` (backend local)
- O en Railway Variables (producción)
- Reinicia el servidor después de agregar la variable

### Error: "Meshy API error: 401"

- API key inválida o expirada
- Genera una nueva en https://app.meshy.ai/api-keys

### Error: "Meshy API error: 429"

- Límite de rate alcanzado
- Espera unos minutos o upgrade tu plan

### La generación tarda mucho

- Tiempo normal: 1-3 minutos
- Si tarda >5 minutos, chequea el status en Meshy dashboard
- El sistema hace polling cada 10 segundos automáticamente

### El modelo generado es muy pequeño/grande

- Usa el botón **"Probar escala"** en el formulario
- Si la escala no coincide, la validación te dará sugerencias
- Meshy genera modelos en unidades arbitrarias, la validación ajusta automáticamente

---

## 🎨 Tips para mejores resultados

### Calidad de imagen

✅ **Bueno**:
- Fondo blanco o neutro
- Iluminación uniforme sin sombras duras
- Vista frontal o 3/4 para capturar profundidad
- Alta resolución (800x800 px mínimo)
- Objeto centrado

❌ **Malo**:
- Fondo desordenado
- Sombras pronunciadas
- Vista lateral plana (pierde profundidad)
- Baja resolución
- Objeto cortado

### Tipos de muebles

- **Excelente**: Sillas, mesas, sofás, lámparas
- **Bueno**: Estanterías, escritorios, camas
- **Regular**: Objetos con mucho detalle fino (textiles complejos)

---

## 🔐 Security

- Las API keys son **privadas**, nunca las expongas en el frontend
- Los endpoints están protegidos con autenticación (requireRole)
- Solo usuarios ADMIN o STORE pueden generar modelos
- STORE users solo pueden generar modelos para sus propios productos

---

## 📈 Monitoring

Ver historial de generaciones de un producto:

```bash
curl https://api.amobly.ar/api/admin/ai-3d/jobs/product/123 \
  -H "Cookie: session=xxx"
```

Respuesta:
```json
{
  "jobs": [
    {
      "id": 456,
      "productId": 123,
      "status": "SUCCEEDED",
      "glbUrl": "...",
      "createdAt": "2026-02-24T00:00:00Z"
    }
  ]
}
```

---

## 🚀 Next Steps

Si quieres expandir la funcionalidad:

1. **Webhooks**: Configurar webhook de Meshy para notificaciones push (en vez de polling)
2. **Batch processing**: Generar modelos para múltiples productos en paralelo
3. **AI improvements**: Usar prompts para controlar estilo, textura, nivel de detalle
4. **Alternative providers**: Integrar Luma AI, Tripo AI, CSM para comparar resultados
5. **Texture customization**: Permitir cambiar colores/materiales en tiempo real

---

## 📚 Resources

- Meshy Docs: https://docs.meshy.ai
- Meshy Dashboard: https://app.meshy.ai
- Pricing: https://meshy.ai/pricing
- Support: support@meshy.ai

---

**¿Preguntas?** Abre un issue en GitHub o contacta al equipo de desarrollo.
