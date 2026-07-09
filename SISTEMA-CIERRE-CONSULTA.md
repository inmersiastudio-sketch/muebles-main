# SISTEMA DE CIERRE DE CONSULTA (Post-WhatsApp)

## 🎯 Concepto

Amobly NO interviene en el pago. La mueblería y el cliente se arreglan por WhatsApp.

PERO después de la conversación por WhatsApp, la mueblería vuelve a Amobly y marca:
- ✅ **VENDIDO** → Opcionalmente actualiza stock
- ❌ **PERDIDO** → Indica motivo (precio, stock, no respondió, etc.)
- ⏸️ **EN ESPERA** → Cliente pensándolo

## 📊 Flujo Completo

```
CLIENTE                      AMOBLY                      MUEBLERÍA
   │                            │                            │
   │── Ver producto ───────────>│                            │
   │                            │                            │
   │── Click "Consultar" ──────>│                            │
   │                            │── Guardar consulta ───────>│
   │                            │   (con datos del cliente)  │
   │                            │                            │
   │<── Abre WhatsApp ──────────│                            │
   │   (con mensaje pre-armado) │                            │
   │                            │                            │
   │── Conversación ────────────────────────────────────────>│
   │   (fuera de Amobly)        │                            │
   │                            │                            │
   │                            │<── Cerrar consulta ─────────│
   │                            │   (marca resultado)        │
   │                            │                            │
   │                            │── Actualizar métricas ─────>│
   │                            │   (conversión, motivos)    │
```

---

## 📝 Estructura de Datos

### Nueva Tabla: `ProductInquiry` (ya existe en schema, la extendemos)

```prisma
model ProductInquiry {
  id          Int      @id @default(autoincrement())
  productId   Int
  storeId     Int
  
  // Datos del cliente (que dejó en el formulario)
  customerName    String
  customerPhone   String
  customerEmail   String?
  
  // Qué consultó
  variantId   String?  // Si especificó color/tamaño
  message     String?  // Comentario opcional del cliente
  
  // Estado del seguimiento
  status      InquiryStatus @default(NEW)
  
  // Resultado (cuando la mueblería cierra)
  result      InquiryResult?
  resultNote  String?        // Nota opcional
  finalAmount Decimal?       // Monto final de la venta (si vendió)
  
  // Fechas
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  closedAt    DateTime?
  
  // Relaciones
  product     Product  @relation(fields: [productId], references: [id])
  store       Store    @relation(fields: [storeId], references: [id])
}

enum InquiryStatus {
  NEW           // Nueva, no vista aún
  VIEWED        // La mueblería la abrió
  CONTACTED     // Ya contactaron al cliente
  CLOSED        // Tiene resultado final
}

enum InquiryResult {
  SOLD          // Se vendió
  LOST_PRICE    // Perdido por precio
  LOST_STOCK    // Perdido porque no había stock
  LOST_NO_REPLY // Cliente no respondió
  LOST_OTHER    // Otro motivo
  PENDING       // Quedó pendiente/pensándolo
}
```

---

## 🖥️ Interfaz para la Mueblería

### 1. Notificación de Nueva Consulta

```
┌─────────────────────────────────────────────────────────────┐
│  🔔 NUEVA CONSULTA                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  👤 Juan Pérez quiere:                                      │
│  🛋️ Sofá Escandinavo - Rojo - 3 cuerpos                    │
│                                                             │
│  📱 +54 9 351 234-5678                                      │
│  💬 "Tienen para entrega esta semana?"                      │
│                                                             │
│  [📲 Responder por WhatsApp]                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2. Panel de Consultas (tipo inbox)

```
┌─────────────────────────────────────────────────────────────┐
│  CONSULTAS DE CLIENTES                    [Filtrar] [🔍]   │
├─────────────────────────────────────────────────────────────┤
│  🔴 Nuevas (3)  🟡 En seguimiento (2)  🟢 Cerradas (10)    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔴 Juan Pérez                        Hace 5 min    │   │
│  │ 📱 +54 9 351 234-5678                              │   │
│  │ 🛋️ Sofá Escandinavo Rojo - $850.000               │   │
│  │ 💬 "Tienen para entrega esta semana?"             │   │
│  │                                                     │   │
│  │ [📲 WhatsApp]  [✅ Marcar como...]  [👁️ Ver]      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🟡 María González                   Hace 2 horas   │   │
│  │ 📱 +54 9 351 876-5432                              │   │
│  │ 🛋️ Mesa de centro + 2 sillas - $650.000           │   │
│  │ Estado: Esperando respuesta del cliente            │   │
│  │                                                     │   │
│  │ [📲 WhatsApp]  [✅ Marcar como...]                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3. Modal "Marcar como..."

Cuando la mueblería cierra la consulta:

```
┌─────────────────────────────────────────────────────────────┐
│  CERRAR CONSULTA - Juan Pérez                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ¿Qué pasó con esta consulta?                               │
│                                                             │
│  [✅ VENDIDO]  [❌ PERDIDO]  [⏸️ QUEDÓ PENDIENTE]          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Si fue VENDIDO:                                            │
│  💰 Monto final de la venta: [$________]                    │
│                                                             │
│  [✓ Actualizar stock automáticamente]                       │
│     (-1 unidad del variante seleccionado)                   │
│                                                             │
│  Nota interna (opcional):                                   │
│  [________________________________]                         │
│                                                             │
│              [Cancelar]  [Guardar]                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4. Si fue PERDIDO:

```
┌─────────────────────────────────────────────────────────────┐
│  ¿Por qué se perdió esta venta?                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ○ Precio muy alto                                          │
│  ○ No teníamos stock                                        │
│  ○ Cliente no respondió                                     │
│  ○ Compró en otro lado                                      │
│  ○ Otro: [________________]                                 │
│                                                             │
│              [Cancelar]  [Guardar]                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📈 Métricas que Obtienen las Mueblerías

```
┌─────────────────────────────────────────────────────────────┐
│  MIS ESTADÍSTICAS - Marzo 2025                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  CONSULTAS RECIBIDAS: 45                                    │
│  ├── Respondidas: 40 (89%)                                  │
│  └── Sin responder: 5 (11%) ⚠️                              │
│                                                             │
│  RESULTADOS:                                                │
│  ✅ Vendidas:        12  (27%)  → $15.400.000 en ventas     │
│  ❌ Perdidas:        28  (62%)                              │
│  │   ├── Por precio:     15                                 │
│  │   ├── Sin stock:       4  ⚠️ (revisar inventario)        │
│  │   ├── No respondió:    6                                 │
│  │   └── Otros:           3                                 │
│  └── ⏸️ Pendientes:   5  (11%)                              │
│                                                             │
│  PRODUCTOS MÁS CONSULTADOS:                                 │
│  1. Sofá Escandinavo (12 consultas → 3 ventas)              │
│  2. Mesa Carrara (8 consultas → 1 venta)                    │
│  3. Cama King (5 consultas → 2 ventas) ✅ 40% conversión    │
│                                                             │
│  DÍAS Y HORARIOS CON MÁS CONSULTAS:                         │
│  Mejores días: Viernes, Sábado                              │
│  Mejor horario: 19:00 - 21:00                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Gestión de Stock

### Opción A: Actualización Manual (simple)
La mueblería entra al producto y modifica el stock.

### Opción B: Actualización al Cerrar Consulta (recomendada)
Cuando marcan "VENDIDO", el sistema pregunta:
"¿Descontar 1 unidad del stock?"
- Sí → Stock se reduce automáticamente
- No → Stock queda igual (si ya lo actualizaron manualmente)

### Opción C: Sincronización con Sistema de la Mueblería (futuro)
Si la mueblería usa un sistema de gestión, se puede integrar vía API.

---

## 💰 Modelo de Negocio

**Plan Gratis:**
- Hasta 30 consultas/mes
- Dashboard básico
- Sin métricas históricas

**Plan Pro: $29/mes**
- Consultas ilimitadas
- Dashboard completo con métricas
- Alertas de consultas sin responder
- Exportar datos a Excel
- Actualización automática de stock

**Plan Premium: $59/mes**
- Todo lo anterior
- Múltiples usuarios (vendedores) por tienda
- Asignación de consultas a vendedores
- Comparación entre sucursales
- API para integraciones

---

## ✅ Ventajas de este Sistema

### Para Vos (Amobly):
1. **No te metés en plata** - Zero riesgo legal/financiero
2. **Datos valiosos** - Sabés qué productos convierten
3. **Sticky** - Las mueblerías vuelven a tu plataforma para cerrar consultas
4. **Mejorable** - Podés agregar features de seguimiento

### Para la Mueblería:
1. **No pierden consultas** - Todo queda registrado
2. **Métricas** - Saben cuánto están convirtiendo
3. **Fácil** - Un click para marcar resultado
4. **Stock actualizado** - Opcionalmente se actualiza solo

### Para el Cliente:
1. **Rápido** - WhatsApp directo, sin formularios largos
2. **Personalizado** - Hablan con un humano de la mueblería

---

## 🚀 Implementación

### FASE 1: Básico (3-4 días)
- [ ] Modal simple al clickear WhatsApp (pedir nombre + teléfono)
- [ ] Guardar consulta en BD
- [ ] Panel básico de "Consultas sin responder"
- [ ] Botón "Marcar como vendido/perdido"

### FASE 2: Métricas (3-4 días)
- [ ] Dashboard de estadísticas
- [ ] Categorización de "perdidos" (por qué se perdió)
- [ ] Alertas de consultas viejas sin cerrar
- [ ] Opción de actualizar stock al cerrar

### FASE 3: Mejoras (1 semana)
- [ ] Notificaciones por email a la mueblería
- [ ] Múltiples usuarios por tienda
- [ ] App móvil simple para las mueblerías
- [ ] Integración con Google Calendar (agendar visitas)

---

## ❓ DECISIÓN

¿Te parece bien este modelo?

1. **Cliente consulta** → Abre WhatsApp (como ahora)
2. **Sistema guarda** → La consulta queda registrada
3. **Mueblería cierra** → Vuelve y marca resultado (vendido/perdido)
4. **Métricas** → Todos ven conversiones y stats
5. **Stock** → Se puede actualizar automáticamente

¿Arrancamos con esto? Es más simple que un checkout completo y resuelve el problema real: el seguimiento.
