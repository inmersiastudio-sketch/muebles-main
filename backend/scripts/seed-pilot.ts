import { randomUUID } from "node:crypto";
import {
  MediaFormat,
  MediaType,
  PrismaClient,
  SubscriptionTier,
  UserRole,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const STORE_SLUG = "estudio-nativo-piloto";
const PRODUCT_SLUG = "sofa-nativo-boucle-piloto";
const OWNER_EMAIL = "piloto@amobly.demo";

function publicUrl(value: string | undefined, fallback: string): string {
  return (value?.trim() || fallback).replace(/\/$/, "");
}

async function main(): Promise<void> {
  const siteUrl = publicUrl(process.env.SITE_URL, "http://localhost:3000");
  const apiUrl = publicUrl(process.env.API_BASE_URL, "http://localhost:3001");
  const configuredPassword = process.env.PILOT_STORE_PASSWORD?.trim();
  const password = configuredPassword || randomUUID();
  const passwordHash = await bcrypt.hash(password, 12);
  const now = new Date();

  const owner = await prisma.user.upsert({
    where: { email: OWNER_EMAIL },
    update: {
      name: "Equipo Estudio Nativo (Piloto)",
      role: UserRole.STORE_OWNER,
      isActive: true,
      emailVerified: now,
      ...(configuredPassword ? { password: passwordHash } : {}),
    },
    create: {
      email: OWNER_EMAIL,
      password: passwordHash,
      name: "Equipo Estudio Nativo (Piloto)",
      role: UserRole.STORE_OWNER,
      isActive: true,
      emailVerified: now,
    },
  });

  const store = await prisma.store.upsert({
    where: { slug: STORE_SLUG },
    update: {
      name: "Estudio Nativo · Piloto Amobly",
      description:
        "Mueblería piloto de Córdoba especializada en piezas contemporáneas, producción responsable y experiencias de compra con realidad aumentada.",
      logoUrl: `${siteUrl}/logo_azul.png`,
      bannerUrl: `${siteUrl}/images/landing-hero.png`,
      email: OWNER_EMAIL,
      phone: process.env.PILOT_STORE_PHONE?.trim() || null,
      whatsapp: process.env.PILOT_STORE_WHATSAPP?.trim() || null,
      address: "Av. Colón 1250",
      city: "Córdoba",
      province: "Córdoba",
      zipCode: "X5000",
      country: "Argentina",
      website: siteUrl,
      socialInstagram: "estudionativo.piloto",
      businessHours: {
        monday: { open: "09:00", close: "18:00" },
        tuesday: { open: "09:00", close: "18:00" },
        wednesday: { open: "09:00", close: "18:00" },
        thursday: { open: "09:00", close: "18:00" },
        friday: { open: "09:00", close: "18:00" },
        saturday: { open: "10:00", close: "14:00" },
      },
      responseTimeMinutes: 30,
      rating: 4.9,
      isActive: true,
      isVerified: true,
      subscriptionTier: SubscriptionTier.GOLD,
      maxProducts: 100,
      ownerId: owner.id,
    },
    create: {
      name: "Estudio Nativo · Piloto Amobly",
      slug: STORE_SLUG,
      description:
        "Mueblería piloto de Córdoba especializada en piezas contemporáneas, producción responsable y experiencias de compra con realidad aumentada.",
      logoUrl: `${siteUrl}/logo_azul.png`,
      bannerUrl: `${siteUrl}/images/landing-hero.png`,
      email: OWNER_EMAIL,
      phone: process.env.PILOT_STORE_PHONE?.trim() || null,
      whatsapp: process.env.PILOT_STORE_WHATSAPP?.trim() || null,
      address: "Av. Colón 1250",
      city: "Córdoba",
      province: "Córdoba",
      zipCode: "X5000",
      country: "Argentina",
      website: siteUrl,
      socialInstagram: "estudionativo.piloto",
      businessHours: {
        monday: { open: "09:00", close: "18:00" },
        tuesday: { open: "09:00", close: "18:00" },
        wednesday: { open: "09:00", close: "18:00" },
        thursday: { open: "09:00", close: "18:00" },
        friday: { open: "09:00", close: "18:00" },
        saturday: { open: "10:00", close: "14:00" },
      },
      responseTimeMinutes: 30,
      rating: 4.9,
      isActive: true,
      isVerified: true,
      subscriptionTier: SubscriptionTier.GOLD,
      maxProducts: 100,
      ownerId: owner.id,
    },
  });

  const productData = {
    sku: "PILOT-SOFA-001",
    name: "Sofá Nativo Bouclé · 3 cuerpos",
    description:
      "Sofá contemporáneo de tres cuerpos, tapizado en bouclé natural de alta resistencia. Estructura de madera maciza estacionada, almohadones de espuma de alta densidad y patas de guatambú. El modelo 3D está calibrado a escala física real para probarlo en tu ambiente antes de consultar.",
    isActive: true,
    isFeatured: true,
    category: "sofas",
    subcategory: "sofas-3-cuerpos",
    room: "living",
    style: "contemporaneo",
    tags: ["sofá", "tres cuerpos", "bouclé natural", "living", "modelo 3D", "realidad aumentada"],
    metaTitle: "Sofá Nativo Bouclé 3 cuerpos con realidad aumentada",
    metaDescription:
      "Probá el Sofá Nativo Bouclé a escala real con realidad aumentada. Medidas, embalaje, materiales y opciones de consulta.",
    keywords: ["sofá bouclé", "sofá 3 cuerpos", "muebles Córdoba", "sofá realidad aumentada"],
    storeId: store.id,
    materials: {
      structure: "Madera maciza estacionada",
      upholstery: "Bouclé natural de alta resistencia",
      filling: "Espuma de alta densidad 30 kg/m³",
      legs: "Guatambú macizo con terminación natural",
      care: "Aspirar suavemente y limpiar manchas con paño apenas húmedo",
    },
    warranty: {
      months: 12,
      coverage: "Estructura, costuras y defectos de fabricación",
      exclusions: "Daños por humedad, mascotas o uso inadecuado",
    },
    logistics: {
      deliveryTimeDays: { min: 7, max: 12 },
      deliveryType: "A coordinar directamente con la mueblería",
      shippingZones: ["Córdoba Capital", "Gran Córdoba"],
      assemblyRequired: false,
      shipsPackaged: true,
      packaging: {
        piecesCount: 1,
        recyclable: true,
        specialHandling: true,
        notes: "Bulto único protegido con cartón corrugado y cantoneras.",
      },
    },
    dimensions: {
      widthCm: 200,
      heightCm: 90,
      depthCm: 80,
      weightKg: 55,
      volumeM3: 1.44,
      arVerified: true,
      packageDimensions: {
        widthCm: 205,
        heightCm: 95,
        depthCm: 85,
        weightKg: 62,
      },
    },
    seo: {
      canonicalSlug: PRODUCT_SLUG,
      highlights: ["Escala AR 1:1", "Embalaje visualizable en AR", "Fabricación nacional"],
    },
  };

  const product = await prisma.product.upsert({
    where: { slug: PRODUCT_SLUG },
    update: productData,
    create: { ...productData, slug: PRODUCT_SLUG },
  });

  await prisma.productPricing.upsert({
    where: { productId: product.id },
    update: {
      currency: "ARS",
      listPrice: 1_890_000,
      salePrice: 1_590_000,
      shippingCost: null,
      financingOptions: [
        { installments: 3, installmentPrice: 530_000, interestFree: true },
        { installments: 6, installmentPrice: 298_125, interestFree: false },
      ],
    },
    create: {
      productId: product.id,
      currency: "ARS",
      listPrice: 1_890_000,
      salePrice: 1_590_000,
      shippingCost: null,
      financingOptions: [
        { installments: 3, installmentPrice: 530_000, interestFree: true },
        { installments: 6, installmentPrice: 298_125, interestFree: false },
      ],
    },
  });

  await prisma.productInventory.upsert({
    where: { productId: product.id },
    update: {
      trackStock: true,
      allowBackorder: true,
      totalStock: 4,
      reservedStock: 1,
      availableStock: 3,
      lowStockAlert: 2,
    },
    create: {
      productId: product.id,
      trackStock: true,
      allowBackorder: true,
      totalStock: 4,
      reservedStock: 1,
      availableStock: 3,
      lowStockAlert: 2,
    },
  });

  await prisma.productVariant.upsert({
    where: { sku: "PILOT-SOFA-001-NATURAL" },
    update: {
      productId: product.id,
      name: "Natural · Bouclé",
      color: "Natural",
      fabric: "Bouclé de alta resistencia",
      size: "3 cuerpos",
      finish: "Patas naturales",
      listPrice: 1_890_000,
      salePrice: 1_590_000,
      currency: "ARS",
      stock: 4,
      reservedStock: 1,
      isDefault: true,
    },
    create: {
      sku: "PILOT-SOFA-001-NATURAL",
      productId: product.id,
      name: "Natural · Bouclé",
      color: "Natural",
      fabric: "Bouclé de alta resistencia",
      size: "3 cuerpos",
      finish: "Patas naturales",
      listPrice: 1_890_000,
      salePrice: 1_590_000,
      currency: "ARS",
      stock: 4,
      reservedStock: 1,
      isDefault: true,
    },
  });

  const imageUrl =
    process.env.PILOT_PRODUCT_IMAGE_URL?.trim() ||
    `${siteUrl}/images/examples/sofa-boucle-roble-ai.png`;
  const modelUrl = `${apiUrl}/api/ar/demo/pilot-sofa.glb`;

  await prisma.$transaction([
    prisma.productMedia.deleteMany({ where: { productId: product.id } }),
    prisma.productMedia.createMany({
      data: [
        {
          productId: product.id,
          type: MediaType.IMAGE,
          url: imageUrl,
          alt: "Sofá Nativo Bouclé natural de tres cuerpos",
          sortOrder: 0,
          isPrimary: true,
        },
        {
          productId: product.id,
          type: MediaType.MODEL_3D,
          mediaFormat: MediaFormat.GLB,
          url: modelUrl,
          alt: "Modelo 3D a escala real del Sofá Nativo Bouclé",
          sortOrder: 1,
          isPrimary: false,
        },
      ],
    }),
  ]);

  console.log("\nPiloto creado/actualizado sin borrar datos existentes.");
  console.log(`Tienda:   ${siteUrl}/catalog/${STORE_SLUG}`);
  console.log(`Producto: ${siteUrl}/productos/${PRODUCT_SLUG}`);
  console.log(`Catálogo: ${siteUrl}/catalog/${STORE_SLUG}/${PRODUCT_SLUG}`);
  console.log(`Modelo:   ${modelUrl}`);
  console.log(`Caja AR:  ${apiUrl}/api/ar/package/${product.id}`);
  if (!configuredPassword) {
    console.log("Login piloto deshabilitado: definí PILOT_STORE_PASSWORD para habilitarlo.");
  }
}

main()
  .catch((error) => {
    console.error("No se pudo crear el piloto:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
