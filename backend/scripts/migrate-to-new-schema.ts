import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrate() {
    console.log('🚀 Iniciando migración de datos...\n');

    try {
        // 1. MIGRAR PRODUCTOS EXISTENTES
        console.log('📦 Migrando productos...');

        const oldProducts = await prisma.$queryRaw<any[]>`SELECT * FROM products`;
        console.log(`   Encontrados ${oldProducts.length} productos locales\n`);

        for (const oldProduct of oldProducts) {
            console.log(`   → Migrando: ${oldProduct.name}`);

            const widthCm = oldProduct.widthCm || oldProduct.width_cm || 0;
            const heightCm = oldProduct.heightCm || oldProduct.height_cm || 0;
            const depthCm = oldProduct.depthCm || oldProduct.depth_cm || 0;
            const weightKg = oldProduct.weightKg || oldProduct.weight_kg || 0;
            const price = oldProduct.price || 0;
            const stockQty = oldProduct.stockQty || oldProduct.stock_qty || 999;

            const volumeM3 = widthCm && heightCm && depthCm
                ? (widthCm * heightCm * depthCm) / 1000000
                : 0;

            // Actualizar producto con nuevos campos JSON
            await prisma.$executeRaw`
        UPDATE products 
        SET 
          dimensions = ${JSON.stringify({ widthCm, heightCm, depthCm, weightKg, volumeM3: Math.round(volumeM3 * 100) / 100 })},
          materials = ${JSON.stringify({ primary: oldProduct.material || 'No especificado', finish: 'No especificado', certifications: [] })},
          warranty = ${JSON.stringify({ type: 'factory', durationMonths: 12, coverage: 'Garantía de fábrica', conditions: ['Defectos de fabricación'], exclusions: ['Desgaste normal', 'Mal uso'] })},
          logistics = ${JSON.stringify({ deliveryTimeDays: { min: 3, max: 7 }, deliveryType: 'home', shippingZones: ['CABA', 'GBA'], assembly: { included: false, difficulty: 'medium' }, packaging: { piecesCount: 1, specialHandling: false } })},
          seo = ${JSON.stringify({ metaTitle: oldProduct.name, metaDescription: (oldProduct.description || '').substring(0, 160), keywords: [] })},
          sku = COALESCE(${oldProduct.sku}, ${`SKU-${oldProduct.id}`}),
          tags = ${JSON.stringify([])},
          "isFeatured" = false
        WHERE id = ${oldProduct.id}
      `;

            // 2. CREAR VARIANTE DEFAULT
            const existingVariant = await prisma.$queryRaw<any[]>`SELECT id FROM product_variants WHERE "productId" = ${oldProduct.id} LIMIT 1`;
            if (existingVariant.length === 0) {
                await prisma.$executeRaw`
          INSERT INTO product_variants (
            id, sku, name, color, fabric, size, finish,
            "listPrice", "salePrice", currency, stock, "isDefault", "productId", "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid(), ${`SKU-${oldProduct.id}-DEFAULT`}, 'Default', ${oldProduct.color || null}, null, null, null,
            ${Math.round(price * 1.25)}, ${price}, 'ARS', ${stockQty}, true, ${oldProduct.id}, NOW(), NOW()
          )
        `;
            }

            // 3. CREAR PRECIO GENERAL
            const existingPricing = await prisma.$queryRaw<any[]>`SELECT id FROM product_pricing WHERE "productId" = ${oldProduct.id} LIMIT 1`;
            if (existingPricing.length === 0) {
                await prisma.$executeRaw`
          INSERT INTO product_pricing (
            currency, "listPrice", "salePrice", "shippingCost", "financingOptions", "productId"
          ) VALUES (
            'ARS', ${Math.round(price * 1.25)}, ${price}, null, ${JSON.stringify([])}, ${oldProduct.id}
          )
        `;
            }

            // 4. CREAR INVENTARIO
            const existingInventory = await prisma.$queryRaw<any[]>`SELECT id FROM product_inventory WHERE "productId" = ${oldProduct.id} LIMIT 1`;
            if (existingInventory.length === 0) {
                await prisma.$executeRaw`
          INSERT INTO product_inventory (
            "trackStock", "allowBackorder", "totalStock", "reservedStock", 
            "availableStock", "lowStockAlert", "productId"
          ) VALUES (
            true, false, ${stockQty}, 0, ${stockQty}, 5, ${oldProduct.id}
          )
        `;
            }
            console.log(`   ✅ ${oldProduct.name} migrado\n`);
        }

        console.log('🔍 Verificando migración...\n');
        console.log('\n✅ Migración completada exitosamente!');

    } catch (error) {
        console.error('\n❌ Error en migración:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

migrate()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
