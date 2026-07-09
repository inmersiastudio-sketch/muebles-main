# FLUJO DE VENTA POR WHATSAPP - MODELO MEJORADO

## 🎯 El Problema Actual

```
Cliente en PDP
    ↓
Click "Consultar por WhatsApp"
    ↓
Se abre WhatsApp con mensaje pre-armado
    ↓
❌ La mueblería NO se entera en tiempo real
❌ No hay registro de la consulta en el sistema
❌ Si hay 10 consultas, no saben cuáles ya respondieron
❌ No hay métricas de conversión
```

## ✅ Solución: "Lead Management" para WhatsApp

No cambiamos WhatsApp como canal de cierre, pero agregamos una capa de gestión en el medio.

```
Cliente en PDP
    ↓
Click "Reservar / Consultar" 
    ↓
Sistema GUARDA la consulta con:
  - Productos seleccionados
  - Datos del cliente (nombre, teléfono, email)
  - Total estimado
  - Fecha/hora
  - Estado: "Nueva"
    ↓
WhatsApp se abre con mensaje mejorado
    ↓
NOTIFICACIÓN REAL-TIME a la mueblería
    ↓
Dashboard de seguimiento
```

---

## 📋 FLUJO DETALLADO

### 1. Desde el lado del Cliente

**Cambio en el PDP:**
- Botón principal: **"Reservar consulta"** (en vez de "Consultar por WhatsApp")
- Click abre modal ligero:
  - "Dejanos tus datos y te contactamos en minutos"
  - Nombre
  - WhatsApp
  - Email (opcional)
  - Horario preferido de contacto
  - Comentario (opcional)
- Checkbox: "También quiero recibir cotización por email"

**Beneficio para el cliente:**
- Se siente más "atendido" que solo mandar un mensaje
- Sabe que la mueblería va a ver su consulta
- Puede adjuntar comentarios específicos
- Opcional: recibe email con resumen de su consulta

---

### 2. Desde el lado de la Mueblería

#### A) Notificaciones en tiempo real

```
📱 Notificación Push (si tienen el admin abierto)
📧 Email: "Nueva consulta - Sofá Escandinavo Rojo"
💬 WhatsApp Business API (opcional): "Tenés una nueva consulta en Amobly"
```

#### B) Dashboard de "Consultas" (nuevo)

Panel tipo pipeline:

```
┌─────────────────────────────────────────────────────────────┐
│  CONSULTAS DE CLIENTES                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔴 NUEVAS (3)        🟡 EN PROCESO (2)    🟢 CERRADAS (5) │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 👤 Juan Pérez                    Hace 5 minutos    │   │
│  │ 📱 +54 9 351 234-5678                              │   │
│  │ 🛋️ Sofá Escandinavo Rojo - 3 cuerpos              │   │
│  │ 💰 Total: $850.000                                 │   │
│  │                                                     │   │
│  │ [📲 Responder WhatsApp]  [✏️ Ver detalle] [✓ Cerrar]│   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 👤 María González               Hace 2 horas       │   │
│  │ 📱 +54 9 351 876-5432                              │   │
│  │ 🛋️ 3 productos en el carrito                      │   │
│  │ 💰 Total: $1.250.000                               │   │
│  │                                                     │   │
│  │ [📲 Responder WhatsApp]  [✏️ Ver detalle] [✓ Cerrar]│   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### C) Detalle de consulta

```
┌─────────────────────────────────────────────────────────────┐
│ CONSULTA #1234                                Estado: Nueva │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ CLIENTE                                                     │
│   👤 Juan Pérez                                             │
│   📱 +54 9 351 234-5678                                     │
│   📧 juan@email.com (opcional)                              │
│   🕐 Consultó: 15/03/2025 14:32                             │
│                                                             │
│ PRODUCTOS INTERESADOS                                       │
│   🛋️ Sofá Escandinavo - Rojo - 3 cuerpos    $850.000       │
│   🪑 Mesa de Centro Carrara                  $450.000       │
│   ─────────────────────────────────────────────────────     │
│   TOTAL ESTIMADO:                           $1.300.000      │
│                                                             │
│ COMENTARIO DEL CLIENTE                                      │
│   "Tienen stock para entrega esta semana?"                  │
│                                                             │
│ ACCIONES                                                    │
│   [📲 Abrir WhatsApp]  [📧 Enviar email]  [📝 Agregar nota] │
│                                                             │
│ CAMBIAR ESTADO                                              │
│   [Nueva] [Contactado] [En negociación] [Vendido] [Perdido] │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 ESTADOS DEL PIPELINE

```
NUEVA
  ↓ (La mueblería abre WhatsApp)
CONTACTADO
  ↓ (El cliente responde)
EN NEGOCIACIÓN
  ↓ (Acuerdan precio/envío)
VENDIDO ←→ PERDIDO
```

**Automatizaciones:**
- Si pasa 24hs en "Nueva": Email recordatorio a la mueblería
- Si pasa 48hs sin respuesta del cliente: Email de seguimiento automático al cliente
- Si se marca como "Vendido": Se pregunta monto final para métricas

---

## 📊 MÉTRICAS PARA LA MUEBLERÍA

Dashboard de conversión:

```
┌─────────────────────────────────────────────────────────────┐
│  MÉTRICAS DE VENTAS - Marzo 2025                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  CONSULTAS RECIBIDAS:  45                                   │
│  RESPONDIDAS:          38        (84% tasa de respuesta)    │
│  EN NEGOCIACIÓN:       12                                   │
│  VENTAS CERRADAS:      8         (18% conversión)           │
│                                                             │
│  PRODUCTOS MÁS CONSULTADOS:                                 │
│   1. Sofá Escandinavo (12 consultas)                        │
│   2. Cama King Size (8 consultas)                           │
│                                                             │
│  HORARIO PICO DE CONSULTAS:                                 │
│   19:00 - 22:00                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 💡 VENTAJAS DE ESTE MODELO

### Para la Mueblería:
1. **No pierden consultas** - Todo queda registrado
2. **Métricas reales** - Saben cuántas consultas convierten
3. **Seguimiento** - Pipeline visual del estado de cada cliente
4. **Historial** - Pueden ver qué consultó Juan hace 3 meses
5. **Sin cambiar hábitos** - Siguen usando WhatsApp que ya conocen

### Para el Cliente:
1. **Sensación de seguimiento** - Sabe que la mueblería va a responder
2. **Datos estructurados** - No tiene que repetir qué producto vio
3. **Comodidad** - Puede dejar consulta y seguir navegando

### Para Amobly (vos):
1. **Diferenciador** - MercadoLibre no tiene esto
2. **Retención** - Las mueblerías ven valor en las métricas
3. **Monetizable** - "Consultas ilimitadas" vs "Consultas básicas"

---

## 🚀 IMPLEMENTACIÓN

### FASE 1: Básico (1 semana)
- [ ] Tabla `Inquiry` o `Lead` en BD
- [ ] Modal de consulta en PDP
- [ ] Dashboard simple de consultas
- [ ] Estados básicos (Nueva, Cerrada)

### FASE 2: Mejorado (2 semanas)
- [ ] Notificaciones por email
- [ ] Pipeline con estados
- [ ] Métricas básicas
- [ ] Notas internas por consulta

### FASE 3: Avanzado (1 mes)
- [ ] WhatsApp Business API (notificaciones automáticas)
- [ ] Email automático al cliente
- [ ] Integración con calendario (agendar visitas)
- [ ] App móvil para las mueblerías

---

## 🎯 MODELO DE NEGOCIO SUGERIDO

**Plan Gratis:**
- Hasta 20 consultas/mes
- Dashboard básico
- Sin métricas históricas

**Plan Pro: $39/mes**
- Consultas ilimitadas
- Dashboard completo con métricas
- Notificaciones por email
- Exportar consultas a Excel
- Soporte prioritario

**Plan Premium: $79/mes**
- Todo lo anterior
- WhatsApp Business API integrado
- Respuestas automáticas (chatbot básico)
- Múltiples usuarios por tienda
- API para integraciones

---

## ❓ DECISIÓN

¿Te parece que implementemos este **"Sistema de Consultas/Cotizaciones"**?

Es más rápido de implementar que un checkout completo, y resuelve el problema real que identificaste: que las mueblerías pierden el seguimiento de las consultas.

Luego, si vemos que las mueblerías lo usan mucho, podemos agregar:
- Botón "Pagar seña" (MercadoPago) dentro del flujo
- Facturación electrónica
- Logística/Envíos

¿Querés que arranque con esto?
