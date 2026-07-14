import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Limpiar base de datos en orden de relaciones dependientes
  console.log("Limpiando base de datos...");
  await prisma.subscriptionLog.deleteMany();
  await prisma.productInquiry.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.productLog.deleteMany();
  await prisma.productReview.deleteMany();
  await prisma.productView.deleteMany();
  await prisma.productMedia.deleteMany();
  await prisma.productVariantImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productPricing.deleteMany();
  await prisma.productInventory.deleteMany();
  await prisma.productRelation.deleteMany();
  await prisma.product.deleteMany();
  await prisma.store.deleteMany();
  await prisma.session.deleteMany();
  await prisma.passwordReset.deleteMany();
  await prisma.user.deleteMany();

  console.log("Creando usuarios dueños de tienda...");
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const owner1 = await prisma.user.create({
    data: {
      email: "owner1@amobly.com",
      password: hashedPassword,
      name: "Juan Pérez (Muebles Del Sol)",
      role: UserRole.STORE_OWNER,
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      email: "owner2@amobly.com",
      password: hashedPassword,
      name: "María Gómez (Casa Linda)",
      role: UserRole.STORE_OWNER,
    },
  });

  console.log("Creando tiendas de prueba con el número de WhatsApp del usuario...");
  const store1 = await prisma.store.create({
    data: {
      name: "Muebles Del Sol",
      slug: "muebles-del-sol",
      logoUrl: "https://placehold.co/120x60?text=Del+Sol",
      description: "Mueblería especializada en living y comedor de diseño.",
      whatsapp: "5493517018328",
      phone: "+54 9 351 701-8328",
      email: "mueblesdelsol@gmail.com",
      address: "Av. Siempre Viva 123",
      city: "Córdoba",
      province: "Córdoba",
      isVerified: true,
      ownerId: owner1.id,
    },
  });

  const store2 = await prisma.store.create({
    data: {
      name: "Casa Linda",
      slug: "casa-linda",
      logoUrl: "https://placehold.co/120x60?text=Casa+Linda",
      description: "Diseño escandinavo, nórdico y minimalista para el hogar.",
      whatsapp: "5493517018328",
      phone: "+54 9 351 701-8328",
      email: "casalinda@gmail.com",
      address: "Bv. Chacabuco 456",
      city: "Córdoba",
      province: "Córdoba",
      isVerified: true,
      ownerId: owner2.id,
    },
  });

  console.log("Creando productos con sus variantes y multimedia...");
  
  // Producto 1
  await prisma.product.create({
    data: {
      sku: "SOFA-MOD-001",
      slug: "sofa-moderno-gris-3-cuerpos",
      name: "Sofá Moderno Gris 3 Cuerpos",
      description: "Sofá de tres cuerpos tapizado en chenille gris de alta resistencia. Estructura de madera maciza estacionada y patas lustradas. Ideal para tu living.",
      category: "sofas",
      subcategory: "living",
      room: "living",
      style: "moderno",
      tags: ["sofa", "gris", "living", "sillon"],
      isActive: true,
      isFeatured: true,
      storeId: store1.id,
      dimensions: {
        widthCm: 200,
        heightCm: 85,
        depthCm: 90
      },
      pricing: {
        create: {
          listPrice: 95000,
          salePrice: 75000,
          currency: "ARS",
        }
      },
      inventory: {
        create: {
          trackStock: true,
          totalStock: 15,
          availableStock: 15,
        }
      },
      media: {
        create: [
          {
            type: "IMAGE",
            url: "https://placehold.co/600x400/cccccc/000000?text=Sofa+Moderno+Gris",
            isPrimary: true,
            sortOrder: 0
          },
          {
            type: "MODEL_3D",
            url: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
            mediaFormat: "GLB",
            sortOrder: 1
          }
        ]
      },
      variants: {
        create: [
          {
            sku: "SOFA-MOD-001-GRIS",
            name: "Gris Chenille",
            color: "Gris",
            listPrice: 95000,
            salePrice: 75000,
            stock: 10,
            isDefault: true
          },
          {
            sku: "SOFA-MOD-001-BEIGE",
            name: "Beige Lino",
            color: "Beige",
            listPrice: 99000,
            salePrice: 79000,
            stock: 5,
            isDefault: false
          }
        ]
      }
    }
  });

  // Producto 2
  await prisma.product.create({
    data: {
      sku: "MESA-ESC-002",
      slug: "mesa-comedor-roble-6-personas",
      name: "Mesa Comedor Roble 6 Personas",
      description: "Mesa de comedor de diseño nórdico/escandinavo fabricada enchapada en roble natural. Base de madera maciza laqueada. Capacidad cómoda para 6 personas.",
      category: "mesas",
      subcategory: "comedor",
      room: "comedor",
      style: "escandinavo",
      tags: ["mesa", "madera", "comedor", "roble"],
      isActive: true,
      isFeatured: true,
      storeId: store2.id,
      dimensions: {
        widthCm: 160,
        heightCm: 78,
        depthCm: 90
      },
      pricing: {
        create: {
          listPrice: 110000,
          salePrice: 92000,
          currency: "ARS",
        }
      },
      inventory: {
        create: {
          trackStock: true,
          totalStock: 8,
          availableStock: 8,
        }
      },
      media: {
        create: [
          {
            type: "IMAGE",
            url: "https://placehold.co/600x400/e3c29b/000000?text=Mesa+Roble+Nórdica",
            isPrimary: true,
            sortOrder: 0
          },
          {
            type: "MODEL_3D",
            url: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
            mediaFormat: "GLB",
            sortOrder: 1
          }
        ]
      },
      variants: {
        create: [
          {
            sku: "MESA-ESC-002-ROBLE",
            name: "Roble Natural",
            color: "Roble",
            listPrice: 110000,
            salePrice: 92000,
            stock: 8,
            isDefault: true
          }
        ]
      }
    }
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error running seed command:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
