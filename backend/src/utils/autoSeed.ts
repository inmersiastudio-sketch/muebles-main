import { PrismaClient, UserRole, MediaType, MediaFormat } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function runAutoSeed() {
  try {
    console.log("[auto-seed] Verificando estado de la base de datos...");

    // Check if store "nativo" already exists
    const storeExists = await prisma.store.findUnique({
      where: { slug: "nativo" },
    });

    if (storeExists) {
      console.log("[auto-seed] La tienda 'nativo' ya existe. Omitiendo auto-seed.");
      return;
    }

    console.log("[auto-seed] Creando usuario administrador y tienda por defecto 'Nativo Muebles'...");

    // 1. Crear usuario Super Admin
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.upsert({
      where: { email: "admin@amobly.app" },
      update: { password: adminPassword, role: UserRole.SUPER_ADMIN },
      create: {
        email: "admin@amobly.app",
        name: "Amobly Admin",
        password: adminPassword,
        role: UserRole.SUPER_ADMIN,
        emailVerified: new Date(),
      },
    });

    // 2. Crear usuario Dueño de Tienda
    const ownerPassword = await bcrypt.hash("nativo123", 10);
    const owner = await prisma.user.upsert({
      where: { email: "contacto@nativomuebles.com" },
      update: { password: ownerPassword, role: UserRole.STORE_OWNER },
      create: {
        email: "contacto@nativomuebles.com",
        name: "Nativo Muebles Admin",
        password: ownerPassword,
        role: UserRole.STORE_OWNER,
        emailVerified: new Date(),
      },
    });

    // 3. Crear Tienda "Nativo Muebles"
    const store = await prisma.store.create({
      data: {
        name: "Nativo Muebles",
        slug: "nativo",
        description: "Muebles de diseño contemporáneo y alta calidad. Especialistas en sofás bouclé y diseño nórdico.",
        logoUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=300&q=80",
        bannerUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80",
        email: "contacto@nativomuebles.com",
        whatsapp: "5493512345678",
        phone: "+54 9 351 234-5678",
        address: "Av. Rafael Núñez 4200, Córdoba",
        city: "Córdoba",
        province: "Córdoba",
        country: "Argentina",
        ownerId: owner.id,
        isActive: true,
        isVerified: true,
        ai3dCredits: 10,
        paymentStatus: "ACTIVE",
        planType: "PRO",
      },
    });

    // 4. Actualizar usuario owner con storeId
    await prisma.user.update({
      where: { id: owner.id },
      data: { storeId: store.id } as any,
    });

    // 5. Crear el producto estrella: "Sillón Nativo Bouclé 3 Cuerpos" ($1,590,000)
    const product = await prisma.product.create({
      data: {
        storeId: store.id,
        sku: "NAT-BOUCLE-3C",
        slug: "sillon-nativo-boucle-3-cuerpos",
        name: "Sillón Nativo Bouclé 3 Cuerpos",
        description:
          "Sofá de 3 cuerpos tapizado en exclusiva tela bouclé textura cream, con estructura ergonómica reforzada de madera maciza y veteado suave. Espuma soft de alta densidad para máximo confort y durabilidad.",
        category: "Sofás",
        subcategory: "3 Cuerpos",
        room: "Living",
        style: "Contemporáneo",
        tags: ["bouclé", "sofa", "living", "tendencia", "premium"],
        isActive: true,
        isFeatured: true,
        dimensions: {
          widthCm: 210,
          depthCm: 95,
          heightCm: 85,
          weightKg: 52,
          volumeM3: 1.69,
        },
        materials: {
          primary: "Tela Bouclé Cream Premium",
          structure: "Madera maciza de eucalipto estacionado",
          fill: "Espuma Soft 28kg/m3 de alta densidad",
        },
        warranty: {
          type: "factory",
          durationMonths: 12,
          coverage: "Estructura y costuras",
        },
        logistics: {
          deliveryTimeDays: { min: 3, max: 7 },
          deliveryType: "home",
          shippingZones: ["CABA", "GBA", "Córdoba", "Santa Fe"],
        },
        seo: {
          metaTitle: "Sillón Nativo Bouclé 3 Cuerpos | Nativo Muebles",
          metaDescription: "Ver Sillón Nativo Bouclé 3 Cuerpos en Realidad Aumentada escala real. Envíos a todo el país.",
        },
      },
    });

    // 6. Crear Pricing para el producto ($1,590,000 con precio de lista $1,850,000)
    await prisma.productPricing.create({
      data: {
        productId: product.id,
        currency: "ARS",
        listPrice: 1850000,
        salePrice: 1590000,
      },
    });

    // 7. Crear Inventario
    await prisma.productInventory.create({
      data: {
        productId: product.id,
        trackStock: true,
        totalStock: 10,
        reservedStock: 0,
        availableStock: 10,
      },
    });

    // 8. Crear Variante por defecto
    const variant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        sku: "NAT-BOUCLE-3C-CREAM",
        name: "Cream Natural - 3 Cuerpos",
        color: "crema",
        fabric: "Bouclé Premium",
        size: "210x95x85 cm",
        listPrice: 1850000,
        salePrice: 1590000,
        currency: "ARS",
        stock: 10,
        isDefault: true,
      },
    });

    // 9. Crear Imágenes del Producto (Fotografía real de alta calidad)
    await prisma.productMedia.createMany({
      data: [
        {
          productId: product.id,
          type: MediaType.IMAGE,
          url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
          alt: "Sillón Nativo Bouclé 3 Cuerpos vista frontal",
          sortOrder: 0,
          isPrimary: true,
        },
        {
          productId: product.id,
          type: MediaType.IMAGE,
          url: "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80",
          alt: "Sillón Nativo Bouclé 3 Cuerpos en ambiente living",
          sortOrder: 1,
          isPrimary: false,
        },
        {
          productId: product.id,
          type: MediaType.IMAGE,
          url: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80",
          alt: "Detalle de textura tela bouclé cream",
          sortOrder: 2,
          isPrimary: false,
        },
      ],
    });

    // 10. Crear Modelo 3D de alta definición para Realidad Aumentada (.GLB y .USDZ)
    await prisma.productMedia.createMany({
      data: [
        {
          productId: product.id,
          type: MediaType.MODEL_3D,
          mediaFormat: MediaFormat.GLB,
          url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/GlamVelvetSofa/glTF-Binary/GlamVelvetSofa.glb",
          alt: "Modelo 3D Sofá Glam Bouclé (GLB)",
          sortOrder: 10,
          isPrimary: true,
        },
        {
          productId: product.id,
          type: MediaType.MODEL_3D,
          mediaFormat: MediaFormat.USDZ,
          url: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/GlamVelvetSofa/glTF-USDZ/GlamVelvetSofa.usdz",
          alt: "Modelo 3D Sofá Glam Bouclé para iPhone/QuickLook (USDZ)",
          sortOrder: 11,
          isPrimary: false,
        },
      ],
    });

    console.log("[auto-seed] ✅ Tienda 'Nativo Muebles' y producto 'Sillón Nativo Bouclé 3 Cuerpos' ($1,590,000) creados con éxito!");
    console.log("[auto-seed]    Tienda Slug: nativo");
    console.log("[auto-seed]    Producto Slug: sillon-nativo-boucle-3-cuerpos");
    console.log("[auto-seed]    URL Catálogo: /catalog/nativo/sillon-nativo-boucle-3-cuerpos");
    console.log("[auto-seed]    Super Admin: admin@amobly.app / admin123");
    console.log("[auto-seed]    Store Admin: contacto@nativomuebles.com / nativo123");
  } catch (error) {
    console.error("[auto-seed] ❌ Error durante el auto-seed:", error);
  } finally {
    await prisma.$disconnect();
  }
}
