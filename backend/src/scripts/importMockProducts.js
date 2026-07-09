import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
    console.log('--- Iniciando importación de productos mock ---');

    // Asegurarnos de que exista al menos una tienda para asignar los productos
    let store = await prisma.store.findFirst();
    if (!store) {
        console.log('No se encontró ninguna tienda. Creando tienda "Muebles de Prueba"');
        store = await prisma.store.create({
            data: {
                name: 'Muebles de Prueba',
                slug: 'muebles-de-prueba',
                description: 'Tienda autogenerada por el script de importación.',
            }
        });
    }

    // Leer y parsear el archivo CSV
    const csvFilePath = path.join(__dirname, '../../../mueblesar-web/mock_products.csv');

    if (!fs.existsSync(csvFilePath)) {
        console.error(`No importado. Archivo no encontrado en: ${csvFilePath}`);
        return;
    }

    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
    });

    console.log(`Encontrados ${records.length} productos en el CSV.`);

    // Importar productos
    let importedCount = 0;
    for (const record of records) {
        // Evitar duplicados por slug
        const existing = await prisma.product.findUnique({
            where: { slug: record.slug },
        });

        if (existing) {
            console.log(`Saltando "${record.name}" (Slug ${record.slug} ya existe)`);
            continue;
        }

        try {
            await prisma.product.create({
                data: {
                    storeId: store.id,
                    name: record.name,
                    slug: record.slug,
                    description: record.description,
                    price: parseFloat(record.price),
                    category: record.category,
                    room: record.room,
                    style: record.style,
                    imageUrl: record.imageUrl,
                    // Randomize AR presence for testing
                    arUrl: Math.random() > 0.6 ? "https://example.com/model.glb" : null,
                    inStock: record.inStock === 'true',
                    stockQty: parseInt(record.stockQty, 10),
                    featured: record.featured === 'true',
                    color: record.color,
                },
            });
            importedCount++;
        } catch (e) {
            console.error(`Error importando ${record.name}:`, e.message);
        }
    }

    console.log(`--- Importación Finalizada. ${importedCount} productos nuevos creados. ---`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
