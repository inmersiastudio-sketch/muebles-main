import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import process from "process";
import { validateGlbScale } from "../src/lib/scaleValidator";

const prisma = new PrismaClient();

async function main() {
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.store.deleteMany();

  const stores = await prisma.store.createMany({
    data: [
      {
        name: "Muebles Del Sol",
        slug: "muebles-del-sol",
        logoUrl: "https://placehold.co/120x60?text=Del+Sol",
        description: "Mueblería especializada en living y comedor.",
        whatsapp: "5493511111111",
        address: "Av. Siempre Viva 123, Córdoba",
      },
      {
        name: "Casa Linda",
        slug: "casa-linda",
        logoUrl: "https://placehold.co/120x60?text=Casa+Linda",
        description: "Diseño escandinavo y minimalista.",
        whatsapp: "5493512222222",
        address: "Bv. Principal 456, Córdoba",
      },
    ],
    skipDuplicates: true,
  });

  const storeDelSol = await prisma.store.findUnique({ where: { slug: "muebles-del-sol" } });
  const storeCasaLinda = await prisma.store.findUnique({ where: { slug: "casa-linda" } });

  if (!storeDelSol || !storeCasaLinda) {
    throw new Error("Stores were not created");
  }

  const products = await prisma.product.createMany({
    data: [
      {
        storeId: storeDelSol.id,
        name: "Sofá Moderno Gris 3 Cuerpos",
        slug: "sofa-moderno-gris-3-cuerpos",
        description: "Sofá tapizado en tela gris con patas de madera maciza.",
        price: 75000,
        category: "sofas",
        room: "living",
        style: "moderno",
        widthCm: 112,
        heightCm: 201.1,
        depthCm: 72.4,
        material: "Tela y madera",
        color: "gris",
        inStock: true,
        stockQty: 18,
        featured: true,
        arUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
        glbUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
      },
      {
        storeId: storeCasaLinda.id,
        name: "Mesa Comedor Roble 6 Personas",
        slug: "mesa-comedor-roble-6-personas",
        description: "Mesa de roble macizo con acabado natural.",
        price: 92000,
        category: "mesas",
        room: "comedor",
        style: "escandinavo",
        widthCm: 112,
        heightCm: 201.1,
        depthCm: 72.4,
        material: "Roble macizo",
        color: "madera",
        inStock: true,
        stockQty: 12,
        featured: false,
        arUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
        glbUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
      },
    ],
    skipDuplicates: true,
  });
  // add some example images with colors
  const prod1 = await prisma.product.findUnique({ where: { slug: "sofa-moderno-gris-3-cuerpos" } });
  const prod2 = await prisma.product.findUnique({ where: { slug: "mesa-comedor-roble-6-personas" } });
  if (prod1) {
    await prisma.productImage.createMany({
      data: [
        { productId: prod1.id, url: "https://placehold.co/600x400/cccccc/000000?text=Sof%C3%A1+gris", type: "gris" },
        { productId: prod1.id, url: "https://placehold.co/600x400/ff0000/000000?text=Sof%C3%A1+rojo", type: "rojo" },
      ],
      skipDuplicates: true,
    });
  }
  if (prod2) {
    await prisma.productImage.createMany({
      data: [
        { productId: prod2.id, url: "https://placehold.co/600x400/aa7733/000000?text=Mesa+roble", type: "madera" },
      ],
      skipDuplicates: true,
    });
  }

  // Validación opcional de escala de modelos demo (no bloquea el seed, solo informa)
  const validations = [
    {
      file: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
      width: 112,
      depth: 72.4,
      height: 201.1,
      label: "Sofá Moderno Gris 3 Cuerpos",
    },
    {
      file: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
      width: 112,
      depth: 72.4,
      height: 201.1,
      label: "Mesa Comedor Roble 6 Personas",
    },
  ];

  for (const v of validations) {
    try {
      const result = await validateGlbScale({
        file: v.file,
        width: v.width,
        depth: v.depth,
        height: v.height,
        tolerance: 0.05,
      });
      if (!result.ok) {
        console.warn(
          `[AR scale warning] ${v.label} no coincide con dimensiones declaradas. GLB: ${JSON.stringify(result.sizeCm)} esperado: ${JSON.stringify(
            result.expected,
          )}`,
        );
      } else {
        console.info(`[AR scale OK] ${v.label}`);
      }
    } catch (err) {
      console.warn(`[AR scale error] ${v.label}:`, (err as Error).message);
    }
  }

  const productSofa = await prisma.product.findUnique({ where: { slug: "sofa-moderno-gris-3-cuerpos" } });
  const productMesa = await prisma.product.findUnique({ where: { slug: "mesa-comedor-roble-6-personas" } });

  if (productSofa) {
    await prisma.productImage.create({
      data: {
        productId: productSofa.id,
        url: "https://placehold.co/800x600?text=Sofa+Gris",
        altText: "Sofá Moderno Gris 3 Cuerpos",
        position: 0,
        type: "white_bg",
      },
    });
  }

  if (productMesa) {
    await prisma.productImage.create({
      data: {
        productId: productMesa.id,
        url: "https://placehold.co/800x600?text=Mesa+Roble",
        altText: "Mesa Comedor Roble 6 Personas",
        position: 0,
        type: "white_bg",
      },
    });
  }

  // ventas demo
  if (productSofa && productMesa) {
    await prisma.order.create({
      data: {
        storeId: storeDelSol.id,
        status: "PAID",
        total: 225000,
        customer: "demo@buyer.com",
        items: {
          create: [
            { productId: productSofa.id, quantity: 2, unitPrice: 75000, subtotal: 150000 },
            { productId: productMesa.id, quantity: 1, unitPrice: 75000, subtotal: 75000 },
          ],
        },
      },
    });

    await prisma.order.create({
      data: {
        storeId: storeCasaLinda.id,
        status: "PAID",
        total: 92000,
        customer: "buyer2@example.com",
        items: {
          create: [{ productId: productMesa.id, quantity: 1, unitPrice: 92000, subtotal: 92000 }],
        },
      },
    });
  }

  const adminHash = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { passwordHash: adminHash, role: "ADMIN", storeId: null },
    create: { email: "admin@example.com", name: "Admin", passwordHash: adminHash, role: "ADMIN" },
  });

  if (storeDelSol) {
    const storeHash = await bcrypt.hash("store123", 10);
    await prisma.user.upsert({
      where: { email: "store@example.com" },
      update: { passwordHash: storeHash, role: "STORE", storeId: storeDelSol.id },
      create: { email: "store@example.com", name: "Tienda Demo", passwordHash: storeHash, role: "STORE", storeId: storeDelSol.id },
    });
  }

  console.log({ stores, products });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
