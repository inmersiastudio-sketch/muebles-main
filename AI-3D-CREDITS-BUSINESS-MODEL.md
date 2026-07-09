# 💳 Sistema de Créditos AI 3D - Modelo de Negocio

## 🎯 Propuesta de Valor

**Para Mueblerías**: Generar modelos 3D profesionales sin contratar diseñadores 3D.

**Para MueblesAR**: Monetizar servicio de IA con márgenes saludables.

---

## 💰 Modelo de Pricing Recomendado

### Opción 1: **Freemium + Pay-per-use** ⭐ Recomendado

| Plan | Precio | Créditos incluidos | Precio extra |
|---|---|---|---|
| **Free** | $0/mes | 3 modelos | $10/modelo |
| **Basic** | $4,999 ARS/mes (~$5 USD) | 10 modelos | $5/modelo |
| **Pro** | $14,999 ARS/mes (~$15 USD) | 50 modelos | $3/modelo |
| **Enterprise** | A medida | Ilimitado | N/A |

**Márgenes**:
- Costo Meshy: $0.30-2 por modelo
- Tu precio: $3-10 por modelo
- **Margen bruto: 50-90%** 

---

### Opción 2: **Pay-as-you-go Puro**

Sin suscripción, solo pago por uso:

| Paquete | Precio | Créditos | Costo/modelo |
|---|---|---|---|
| **Starter** | $2,999 ARS | 5 modelos | $600 ARS |
| **Standard** | $9,999 ARS | 20 modelos | $500 ARS |
| **Pro** | $24,999 ARS | 60 modelos | $416 ARS |

**Ventajas**:
- ✅ Sin compromiso mensual
- ✅ Más accesible para mueblerías pequeñas
- ❌ Menos predecible para revenue

---

### Opción 3: **Todo Gratis (Subsidiar con otros servicios)**

```
Estrategia: Loss Leader
```

- Dar generación 3D gratis ilimitada
- Monetizar con:
  - Comisión por venta (cuando implementes checkout)
  - Plan Premium ($X/mes) con analytics avanzadas
  - Featured listings (destacar productos)
  - Ads en la plataforma

**Ventajas**:
- ✅ Diferenciador brutal vs competencia
- ✅ Adopción masiva
- ❌ Necesitas volumen alto para rentabilidad

---

## 🛠️ Implementación Técnica

### 1. Agregar Créditos al Modelo Store

```prisma
model Store {
  // ... campos existentes
  ai3dCredits         Int       @default(3)  // Saldo actual
  ai3dUsed            Int       @default(0)  // Total histórico
  subscriptionTier    String?   @default("FREE")
  creditPurchases     CreditPurchase[]
}

model CreditPurchase {
  id          Int      @id @default(autoincrement())
  store       Store    @relation(fields: [storeId], references: [id])
  storeId     Int
  credits     Int      // Créditos comprados
  amount      Decimal  // Precio pagado
  paymentId   String?  // Mercado Pago ID
  status      String   // PENDING, APPROVED
  createdAt   DateTime @default(now())
}
```

### 2. Modificar Endpoint de Generación

```typescript
// backend/src/routes/ai3d.ts
router.post("/generate", requireRole([Role.ADMIN, Role.STORE]), async (req, res) => {
  // Check credits
  const store = await prisma.store.findUnique({ 
    where: { id: req.user.storeId } 
  });
  
  if (store.ai3dCredits < 1) {
    return res.status(402).json({ 
      error: "Insufficient credits",
      message: "You need to purchase AI 3D credits to generate models",
      currentCredits: store.ai3dCredits,
      buyUrl: "/store/credits/purchase"
    });
  }

  // Deduct credit immediately
  await prisma.store.update({
    where: { id: store.id },
    data: {
      ai3dCredits: { decrement: 1 },
      ai3dUsed: { increment: 1 }
    }
  });

  // If generation fails, refund
  try {
    const taskId = await createImageTo3DTask({...});
  } catch (error) {
    await prisma.store.update({
      where: { id: store.id },
      data: { ai3dCredits: { increment: 1 } }  // Refund
    });
    throw error;
  }
});
```

### 3. Endpoint de Compra de Créditos

```typescript
// backend/src/routes/credits.ts
router.post("/purchase", requireRole([Role.STORE]), async (req, res) => {
  const { credits } = req.body; // 5, 20, 60 credits
  
  // Pricing table
  const prices = {
    5: 2999,   // $2,999 ARS
    20: 9999,
    60: 24999
  };

  const amount = prices[credits];
  
  // Create Mercado Pago preference
  const preference = await mercadopago.preferences.create({
    items: [{
      title: `${credits} Créditos AI 3D`,
      quantity: 1,
      unit_price: amount,
    }],
    metadata: {
      storeId: req.user.storeId,
      credits: credits
    },
    back_urls: {
      success: `${SITE_URL}/store/credits/success`,
      failure: `${SITE_URL}/store/credits/failure`,
    },
    notification_url: `${API_URL}/api/webhooks/mercadopago`
  });

  res.json({ 
    preferenceId: preference.id,
    initPoint: preference.init_point 
  });
});
```

### 4. Webhook Mercado Pago

```typescript
router.post("/webhooks/mercadopago", async (req, res) => {
  const { type, data } = req.body;

  if (type === "payment") {
    const payment = await mercadopago.payment.get(data.id);
    
    if (payment.status === "approved") {
      const { storeId, credits } = payment.metadata;
      
      // Add credits
      await prisma.store.update({
        where: { id: Number(storeId) },
        data: { ai3dCredits: { increment: Number(credits) } }
      });

      // Record purchase
      await prisma.creditPurchase.create({
        data: {
          storeId: Number(storeId),
          credits: Number(credits),
          amount: payment.transaction_amount,
          paymentId: payment.id.toString(),
          status: "APPROVED"
        }
      });
    }
  }

  res.sendStatus(200);
});
```

---

## 📊 Proyección de Revenue

### Escenario Conservador

**Asumiendo**:
- 100 mueblerías activas
- 30% usan AI 3D regularmente
- Promedio: 15 modelos/mes por tienda activa

**Revenue mensual**:
```
30 tiendas × $14,999 ARS (Plan Pro) = $449,970 ARS/mes
≈ $450 USD/mes

Costo Meshy:
30 tiendas × 15 modelos × $1 = $450 USD/mes

Margen: ~$0 (break-even con solo 30 activas)
```

**Necesitas volumen o pricing más alto para rentabilidad.**

---

### Escenario Optimista

**Asumiendo**:
- 500 mueblerías activas
- 40% usan AI 3D
- 200 tiendas en plan Pro ($14,999 ARS)

**Revenue mensual**:
```
200 tiendas × $14,999 ARS = $2,999,800 ARS/mes
≈ $3,000 USD/mes

Costo Meshy (plan Pro $48):
200 × 50 modelos = 10,000 modelos
Necesitas: ~3 cuentas Pro ($144/mes total)

Margen bruto: $3,000 - $144 = $2,856 USD/mes
```

**Rentable con escala.**

---

## 🎯 Recomendación Final

### Estrategia Faseada

**Fase 1 (Primeros 3 meses)**: Loss Leader
- Dar 3-5 modelos gratis/mes a todas las tiendas
- Objetivo: Adopción y feedback
- Costo: ~$50-100/mes (tu cuenta Meshy Starter)

**Fase 2 (Mes 4-6)**: Freemium
- Introducir planes pagos
- 3 gratis + extras pagos
- Objetivo: Empezar a monetizar early adopters

**Fase 3 (Mes 7+)**: Full Monetization
- Reducir free tier a 1 modelo/mes
- Push a planes pagos
- Considerar Enterprise custom pricing

---

## ✅ Próximos Pasos

¿Qué modelo prefieres?

1. **Freemium + Pay-per-use** (balanceado)
2. **Pay-as-you-go puro** (simple)
3. **Gratis temporalmente** (growth)
4. **Otro** (describe)

Una vez que elijas, implemento:
- ✅ Sistema de créditos en DB
- ✅ UI de compra de créditos
- ✅ Integración Mercado Pago
- ✅ Webhook y notificaciones

**¿Cuál prefieres?**
