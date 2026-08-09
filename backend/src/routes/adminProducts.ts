import { Router, Request, Response } from 'express';
import { Prisma, UserRole } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth, requireRole } from '../lib/auth.js';

const router = Router();

router.use(requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.STORE_OWNER]));

// ============================================
// SCHEMAS ZOD VALIDACIÓN
// ============================================

const VariantSchema = z.object({
    id: z.string().optional(), // Para updates
    sku: z.string().optional(),
    name: z.string().default('Estándar'),
    color: z.string().optional(),
    fabric: z.string().optional(),
    size: z.string().optional(),
    finish: z.string().optional(),
    listPrice: z.number().positive(),
    salePrice: z.number().positive(),
    currency: z.string().default('ARS'),
    stock: z.number().int().min(0).default(0),
    isDefault: z.boolean().default(false),
    images: z.array(z.object({
        url: z.string().url(),
        alt: z.string().optional(),
        sortOrder: z.number().default(0),
    })).default([]),
});

const ProductMediaSchema = z.object({
    id: z.number().optional(),
    type: z.enum(['IMAGE', 'VIDEO', 'MODEL_3D', 'DOCUMENT']),
    url: z.string().url(),
    alt: z.string().optional(),
    sortOrder: z.number().default(0),
    isPrimary: z.boolean().default(false),
    mediaFormat: z.enum(['GLB', 'USDZ']).optional(),
    documentType: z.enum(['MANUAL', 'WARRANTY', 'ASSEMBLY_GUIDE', 'CERTIFICATE', 'OTHER']).optional(),
    title: z.string().optional(),
});

const CreateProductSchema = z.object({
    // Core
    storeId: z.number().int().positive().optional(),
    sku: z.string().optional(),
    name: z.string().min(1).max(200),
    description: z.string().optional(),

    // Categorización
    category: z.string().min(1),
    subcategory: z.string().optional(),
    room: z.string().optional(),
    style: z.string().optional(),
    tags: z.array(z.string()).default([]),

    // Estado
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),

    // Estructuras JSON
    dimensions: z.object({
        widthCm: z.number().positive().optional(),
        heightCm: z.number().positive().optional(),
        depthCm: z.number().positive().optional(),
        weightKg: z.number().positive().optional(),
        packageDimensions: z.object({
            widthCm: z.number().positive().optional(),
            heightCm: z.number().positive().optional(),
            depthCm: z.number().positive().optional(),
            weightKg: z.number().positive().optional(),
        }).optional(),
    }).optional(),

    materials: z.object({
        primary: z.string().optional(),
        structure: z.string().optional(),
        upholstery: z.object({
            fabric: z.string().optional(),
            composition: z.string().optional(),
            cleaningCode: z.enum(['W', 'S', 'WS', 'X']).optional(),
        }).optional(),
        legs: z.string().optional(),
        finish: z.string().optional(),
        certifications: z.array(z.string()).default([]),
    }).optional(),

    warranty: z.object({
        type: z.enum(['factory', 'extended', 'none']).optional(),
        durationMonths: z.number().int().positive().optional(),
        coverage: z.string().optional(),
        termsUrl: z.string().url().optional(),
        conditions: z.array(z.string()).default([]),
        exclusions: z.array(z.string()).default([]),
    }).optional(),

    logistics: z.object({
        deliveryTimeDays: z.object({
            min: z.number().int().positive().optional(),
            max: z.number().int().positive().optional(),
        }).optional(),
        deliveryType: z.enum(['home', 'branch', 'pickup', 'multiple']).optional(),
        shippingZones: z.array(z.string()).default(['CABA', 'GBA']),
        assembly: z.object({
            included: z.boolean().optional(),
            price: z.number().optional(),
            estimatedTimeMinutes: z.number().int().optional(),
            difficulty: z.enum(['easy', 'medium', 'professional']).optional(),
            manualUrl: z.string().url().optional(),
        }).optional(),
        packaging: z.object({
            piecesCount: z.number().int().positive().optional(),
            specialHandling: z.boolean().optional(),
        }).optional(),
    }).optional(),

    // SEO
    seo: z.object({
        metaTitle: z.string().max(70).optional(),
        metaDescription: z.string().max(160).optional(),
        keywords: z.array(z.string()).default([]),
    }).optional(),

    // Relaciones
    variants: z.array(VariantSchema).default([]),
    media: z.array(ProductMediaSchema).default([]),

    // Precios generales (si aplica)
    pricing: z.object({
        shippingCost: z.number().nullable().optional(),
        financingOptions: z.array(z.object({
            installments: z.number().int().positive(),
            installmentPrice: z.number().positive(),
            interestFree: z.boolean(),
        })).default([]),
    }).optional(),

    // Inventario general
    inventory: z.object({
        trackStock: z.boolean().default(true),
        allowBackorder: z.boolean().default(false),
        lowStockAlert: z.number().int().default(5),
    }).optional(),
});

const UpdateProductSchema = CreateProductSchema.partial().extend({
    // En update, el SKU puede no cambiar
    sku: z.string().min(1).optional(),
    featured: z.boolean().optional(),
    stockQty: z.coerce.number().int().nonnegative().optional(),
});

// ============================================
// HELPERS
// =========================================

/**
 * Genera un slug único a partir del nombre
 */
async function generateUniqueSlug(name: string, existingId?: number): Promise<string> {
    const baseSlug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const existing = await prisma.product.findUnique({
            where: { slug },
            select: { id: true },
        });

        if (!existing || existing.id === existingId) {
            return slug;
        }

        slug = `${baseSlug}-${counter}`;
        counter++;
    }
}

/**
 * Calcula el volumen en m³
 */
function calculateVolume(dimensions: any): number {
    if (!dimensions || !dimensions.widthCm || !dimensions.heightCm || !dimensions.depthCm) return 0;
    const volume = (dimensions.widthCm * dimensions.heightCm * dimensions.depthCm) / 1000000;
    return Math.round(volume * 100) / 100; // 2 decimales
}

function mapFlatMediaToRequestMedia(req: Request) {
    if (!req.body) return;

    // Auto-generate SKU if missing or empty
    if (!req.body.sku || typeof req.body.sku !== 'string' || req.body.sku.trim() === '') {
        req.body.sku = `SKU-${Date.now().toString(36).toUpperCase()}`;
    }

    // Auto-generate default variant if variants is missing or empty
    const price = Number(req.body.price || req.body.salePrice || req.body.listPrice || 0);
    const stock = Number(req.body.stockQty || req.body.stock || 0);
    const variants = Array.isArray(req.body.variants) ? req.body.variants : [];

    if (variants.length === 0) {
        req.body.variants = [
            {
                sku: `${req.body.sku}-DEF`,
                name: req.body.name || 'Estándar',
                listPrice: price > 0 ? price : 1000,
                salePrice: price > 0 ? price : 1000,
                stock: stock >= 0 ? stock : 0,
                isDefault: true,
                images: [],
            }
        ];
    } else {
        req.body.variants = variants.map((v: any, idx: number) => ({
            ...v,
            sku: v.sku && String(v.sku).trim() !== '' ? String(v.sku) : `${req.body.sku}-VAR-${idx + 1}`,
            name: v.name && String(v.name).trim() !== '' ? String(v.name) : `Variante ${idx + 1}`,
            listPrice: Number(v.listPrice || v.price || price || 1000),
            salePrice: Number(v.salePrice || v.price || price || 1000),
            stock: Number(v.stock ?? stock ?? 0),
            isDefault: v.isDefault ?? (idx === 0),
        }));
    }

    if (req.body.imageUrl || req.body.glbUrl || req.body.usdzUrl || req.body.arUrl) {
        const media = req.body.media && Array.isArray(req.body.media) ? [...req.body.media] : [];
        
        if (req.body.imageUrl && !media.some((m: any) => m.url === req.body.imageUrl)) {
            media.push({ type: 'IMAGE', url: req.body.imageUrl, isPrimary: true });
        }
        if (req.body.glbUrl && !media.some((m: any) => m.url === req.body.glbUrl)) {
            media.push({ type: 'MODEL_3D', url: req.body.glbUrl, mediaFormat: 'GLB' });
        }
        if (req.body.usdzUrl && !media.some((m: any) => m.url === req.body.usdzUrl)) {
            media.push({ type: 'MODEL_3D', url: req.body.usdzUrl, mediaFormat: 'USDZ' });
        }
        if (req.body.arUrl && req.body.arUrl !== req.body.glbUrl && req.body.arUrl !== req.body.usdzUrl && !media.some((m: any) => m.url === req.body.arUrl)) {
            media.push({ type: 'MODEL_3D', url: req.body.arUrl });
        }
        
        req.body.media = media;
    }
}

// ============================================
// RUTAS ADMIN
// ============================================

/**
 * POST /api/admin/products
 * Crear producto completo con transacción
 */
router.post('/', asyncHandler(async (req: Request, res: Response) => {
        // Mapear URLs planas de imágenes/AR al array de multimedia
        mapFlatMediaToRequestMedia(req);

        // 1. Validar input
        const data = CreateProductSchema.parse(req.body);

        // 2. Obtener store del usuario autenticado (middleware de auth)
        const user = (req as any).user;
        const storeId = user?.role === UserRole.SUPER_ADMIN ? data.storeId : user?.storeId;
        if (!storeId) {
            return res.status(403).json({ error: 'No tienes una tienda asociada' });
        }

        // Verificar límite de productos según el plan de suscripción de la tienda
        const store = await prisma.store.findUnique({
            where: { id: storeId },
            select: { maxProducts: true }
        });

        if (store) {
            const productCount = await prisma.product.count({
                where: { storeId, isActive: true }
            });
            if (productCount >= store.maxProducts) {
                return res.status(403).json({ 
                    error: `Límite de catálogo alcanzado. Tu plan actual permite un máximo de ${store.maxProducts} productos.` 
                });
            }
        }

        // 3. Generar slug único
        const slug = await generateUniqueSlug(data.name);

        // 4. Calcular volumen
        const volumeM3 = calculateVolume(data.dimensions);

        // 5. TRANSACTION PRINCIPAL
        const product = await prisma.$transaction(async (tx) => {
            // 5.1 Crear producto base
            const newProduct = await tx.product.create({
                data: {
                    sku: data.sku,
                    slug,
                    name: data.name,
                    description: data.description,
                    storeId,

                    // Categorización
                    category: data.category,
                    subcategory: data.subcategory,
                    room: data.room,
                    style: data.style,
                    tags: data.tags,

                    // Estado
                    isActive: data.isActive,
                    isFeatured: data.isFeatured,

                    // JSON fields
                    dimensions: data.dimensions ? {
                        ...data.dimensions,
                        volumeM3,
                    } : Prisma.JsonNull,
                    materials: data.materials ?? Prisma.JsonNull,
                    warranty: data.warranty ?? Prisma.JsonNull,
                    logistics: data.logistics ?? Prisma.JsonNull,
                    seo: data.seo || {
                        metaTitle: data.name,
                        metaDescription: data.description?.substring(0, 160) || '',
                        keywords: data.tags,
                    },
                },
            });

            // 5.2 Crear variantes
            if (data.variants && data.variants.length > 0) {
                for (const variant of data.variants) {
                    await tx.productVariant.create({
                        data: {
                            sku: variant.sku,
                            name: variant.name,
                            color: variant.color,
                            fabric: variant.fabric,
                            size: variant.size,
                            finish: variant.finish,
                            listPrice: variant.listPrice,
                            salePrice: variant.salePrice,
                            currency: variant.currency,
                            stock: variant.stock,
                            isDefault: variant.isDefault,
                            productId: newProduct.id,
                            // Crear imágenes de variante
                            images: {
                                create: variant.images.map((img, idx) => ({
                                    url: img.url,
                                    alt: img.alt || `${data.name} - ${variant.name}`,
                                    sortOrder: img.sortOrder || idx,
                                })),
                            },
                        },
                    });
                }
            }

            // 5.3 Crear precios generales (si no hay variantes con precios específicos, usamos el primero)
            const defaultVariant = data.variants?.find(v => v.isDefault) || data.variants?.[0];
            const currencyStr: string = defaultVariant?.currency || 'ARS';
            const listPriceNum: number = defaultVariant?.listPrice || 0;
            const salePriceNum: number = defaultVariant?.salePrice || 0;

            await tx.productPricing.create({
                data: {
                    currency: currencyStr,
                    listPrice: listPriceNum,
                    salePrice: salePriceNum,
                    shippingCost: data.pricing?.shippingCost ?? null,
                    financingOptions: data.pricing?.financingOptions || [],
                    productId: newProduct.id,
                },
            });

            // 5.4 Crear inventario
            const totalStock = data.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
            await tx.productInventory.create({
                data: {
                    trackStock: data.inventory?.trackStock ?? true,
                    allowBackorder: data.inventory?.allowBackorder ?? false,
                    totalStock,
                    availableStock: totalStock,
                    lowStockAlert: data.inventory?.lowStockAlert || 5,
                    productId: newProduct.id,
                },
            });

            // 5.5 Crear media
            if (data.media && data.media.length > 0) {
                await tx.productMedia.createMany({
                    data: data.media.map((m, idx) => ({
                        type: m.type as any,
                        url: m.url,
                        alt: m.alt || data.name,
                        sortOrder: m.sortOrder || idx,
                        isPrimary: m.isPrimary || idx === 0,
                        mediaFormat: m.mediaFormat as any,
                        documentType: m.documentType as any,
                        title: m.title,
                        productId: newProduct.id,
                    })),
                });
            }

            return newProduct;
        }, {
            // Opciones de transacción
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            maxWait: 5000, // 5 segundos esperando lock
            timeout: 10000, // 10 segundos timeout
        });

        // 6. Retornar producto creado con todas las relaciones
        const fullProduct = await prisma.product.findUnique({
            where: { id: product.id },
            include: {
                variants: { include: { images: true } },
                pricing: true,
                inventory: true,
                media: true,
                store: { select: { name: true, slug: true } },
            },
        });

        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            product: fullProduct,
        });

    })
);

// Esquema de validación para importación masiva por fila
const BulkItemSchema = z.object({
    id: z.coerce.number().int().positive().optional().nullable(),
    storeId: z.coerce.number().int().positive().optional().nullable(),
    name: z.string().min(1, "El nombre del producto es requerido").max(200),
    price: z.coerce.number().nonnegative("El precio debe ser un número positivo"),
    category: z.string().min(1, "La categoría es requerida"),
    room: z.string().optional().nullable(),
    style: z.string().optional().nullable(),
    inStock: z.preprocess((val) => val === true || val === 'true' || String(val).toLowerCase() === 'true', z.boolean()).default(true),
    stockQty: z.coerce.number().int().nonnegative("El stock debe ser un número entero no negativo").default(0),
    imageUrl: z.string().optional().nullable(),
    glbUrl: z.string().optional().nullable(),
    usdzUrl: z.string().optional().nullable(),
    arUrl: z.string().optional().nullable(),
    widthCm: z.coerce.number().nonnegative().optional().nullable(),
    depthCm: z.coerce.number().nonnegative().optional().nullable(),
    heightCm: z.coerce.number().nonnegative().optional().nullable(),
    weightKg: z.coerce.number().nonnegative().optional().nullable(),
});

/**
 * POST /api/admin/products/bulk
 * Importar / Crear productos en lote (bulk)
 */
router.post('/bulk', asyncHandler(async (req: Request, res: Response) => {
    if (!Array.isArray(req.body)) {
        return res.status(400).json({ error: 'El cuerpo de la solicitud debe ser un array de productos' });
    }

    const items = req.body;
    let created = 0;
    let updated = 0;

    // Obtener storeId del usuario autenticado
    const authStoreId = (req as any).user?.storeId;
    const isSuperAdmin = (req as any).user?.role === UserRole.SUPER_ADMIN;

    // 1. Validar todas las filas con el esquema estricto Zod
    const validatedItems: any[] = [];
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const parsed = BulkItemSchema.safeParse(item);
        if (!parsed.success) {
            const errorMsgs = parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            return res.status(400).json({ error: `Fila ${i + 2} inválida: ${errorMsgs}` });
        }
        validatedItems.push(parsed.data);
    }

    // 2. Verificar límites de productos por tienda
    const newCreationsCountByStore: Record<number, number> = {};
    for (const item of validatedItems) {
        if (!item.id) {
            const storeId = isSuperAdmin && item.storeId ? Number(item.storeId) : authStoreId;
            if (!storeId) {
                return res.status(400).json({ error: `No se especificó una tienda válida para el producto "${item.name}"` });
            }
            newCreationsCountByStore[storeId] = (newCreationsCountByStore[storeId] || 0) + 1;
        }
    }

    // Consultar límites y conteos actuales de catálogo
    for (const [storeIdStr, count] of Object.entries(newCreationsCountByStore)) {
        const storeId = Number(storeIdStr);
        const store = await prisma.store.findUnique({
            where: { id: storeId },
            select: { name: true, maxProducts: true }
        });
        if (store) {
            const productCount = await prisma.product.count({
                where: { storeId, isActive: true }
            });
            if (productCount + count > store.maxProducts) {
                return res.status(403).json({
                    error: `Límite de catálogo alcanzado en la tienda "${store.name}". Capacidad restante: ${store.maxProducts - productCount} productos. Intentaste importar ${count} nuevos.`
                });
            }
        }
    }

    // 3. Ejecutar la transacción para crear o actualizar
    await prisma.$transaction(async (tx) => {
        for (let i = 0; i < validatedItems.length; i++) {
            const item = validatedItems[i];
            const storeId = isSuperAdmin && item.storeId ? Number(item.storeId) : authStoreId;

            if (!storeId) {
                throw new Error(`Fila ${i + 2}: No se especificó una tienda válida`);
            }

            const price = item.price;
            const stockQty = item.stockQty;

            // Mapeo de dimensiones
            const widthCm = Number(item.widthCm) || 0;
            const depthCm = Number(item.depthCm) || 0;
            const heightCm = Number(item.heightCm) || 0;
            const weightKg = Number(item.weightKg) || 10;

            let dimensionsObj: any = Prisma.JsonNull;
            if (widthCm > 0 || depthCm > 0 || heightCm > 0) {
                const vol = (widthCm * depthCm * heightCm) / 1000000;
                dimensionsObj = {
                    widthCm,
                    depthCm,
                    heightCm,
                    weightKg,
                    volumeM3: Math.round(vol * 100) / 100
                };
            }

            if (item.id) {
                // UPDATE
                const productId = Number(item.id);
                // Verificar que el producto pertenece a la tienda
                const existing = await tx.product.findFirst({
                    where: { id: productId, storeId },
                });
                if (!existing) {
                    throw new Error(`Fila ${i + 2}: Producto con ID ${productId} no encontrado o no pertenece a tu tienda`);
                }

                // Generar slug si cambió de nombre
                let slug = existing.slug;
                if (item.name !== existing.name) {
                    slug = await generateUniqueSlug(item.name, productId);
                }

                await tx.product.update({
                    where: { id: productId },
                    data: {
                        name: item.name,
                        slug,
                        category: item.category || existing.category,
                        room: item.room || existing.room,
                        style: item.style || existing.style,
                        dimensions: dimensionsObj !== Prisma.JsonNull ? dimensionsObj : undefined,
                    },
                });

                // Actualizar pricing
                await tx.productPricing.upsert({
                    where: { productId },
                    update: { salePrice: price, listPrice: price },
                    create: { currency: 'ARS', salePrice: price, listPrice: price, productId },
                });

                // Actualizar variante por defecto
                const defaultVariant = await tx.productVariant.findFirst({
                    where: { productId, isDefault: true },
                });
                if (defaultVariant) {
                    await tx.productVariant.update({
                        where: { id: defaultVariant.id },
                        data: {
                            name: item.name,
                            salePrice: price,
                            listPrice: price,
                            stock: stockQty,
                        },
                    });
                }

                // Sincronizar stock total
                const variants = await tx.productVariant.findMany({ where: { productId } });
                const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

                await tx.productInventory.update({
                    where: { productId },
                    data: {
                        totalStock,
                        availableStock: totalStock,
                        trackStock: true,
                    },
                });

                // Actualizar media (eliminar anteriores y recrear)
                await tx.productMedia.deleteMany({ where: { productId } });
                if (item.imageUrl) {
                    await tx.productMedia.create({
                        data: { productId, url: item.imageUrl, type: 'IMAGE', isPrimary: true }
                    });
                }
                if (item.glbUrl) {
                    await tx.productMedia.create({
                        data: { productId, url: item.glbUrl, type: 'MODEL_3D', mediaFormat: 'GLB' }
                    });
                }
                if (item.usdzUrl) {
                    await tx.productMedia.create({
                        data: { productId, url: item.usdzUrl, type: 'MODEL_3D', mediaFormat: 'USDZ' }
                    });
                }
                if (item.arUrl && item.arUrl !== item.glbUrl && item.arUrl !== item.usdzUrl) {
                    await tx.productMedia.create({
                        data: { productId, url: item.arUrl, type: 'MODEL_3D' }
                    });
                }

                updated++;
            } else {
                // CREATE
                const slug = await generateUniqueSlug(item.name);
                const sku = `SKU-${slug}-${Math.floor(1000 + Math.random() * 9000)}`;

                const newProduct = await tx.product.create({
                    data: {
                        sku,
                        slug,
                        name: item.name,
                        description: item.description || '',
                        storeId,
                        category: item.category || 'Varios',
                        room: item.room || '',
                        style: item.style || '',
                        isActive: true, // Siempre activo por defecto
                        isFeatured: false,
                        dimensions: dimensionsObj,
                        materials: Prisma.JsonNull,
                        warranty: Prisma.JsonNull,
                        logistics: Prisma.JsonNull,
                        seo: {
                            metaTitle: item.name,
                            metaDescription: (item.description || '').substring(0, 160),
                            keywords: [],
                        },
                    },
                });

                // Crear pricing
                await tx.productPricing.create({
                    data: { currency: 'ARS', salePrice: price, listPrice: price, productId: newProduct.id },
                });

                // Crear variante por defecto
                await tx.productVariant.create({
                    data: {
                        sku,
                        name: item.name,
                        listPrice: price,
                        salePrice: price,
                        currency: 'ARS',
                        stock: stockQty,
                        isDefault: true,
                        productId: newProduct.id,
                    },
                });

                // Crear inventario inicial
                await tx.productInventory.create({
                    data: {
                        productId: newProduct.id,
                        totalStock: stockQty,
                        availableStock: stockQty,
                        trackStock: true,
                    },
                });

                // Crear media
                if (item.imageUrl) {
                    await tx.productMedia.create({
                        data: { productId: newProduct.id, url: item.imageUrl, type: 'IMAGE', isPrimary: true }
                    });
                }
                if (item.glbUrl) {
                    await tx.productMedia.create({
                        data: { productId: newProduct.id, url: item.glbUrl, type: 'MODEL_3D', mediaFormat: 'GLB' }
                    });
                }
                if (item.usdzUrl) {
                    await tx.productMedia.create({
                        data: { productId: newProduct.id, url: item.usdzUrl, type: 'MODEL_3D', mediaFormat: 'USDZ' }
                    });
                }
                if (item.arUrl && item.arUrl !== item.glbUrl && item.arUrl !== item.usdzUrl) {
                    await tx.productMedia.create({
                        data: { productId: newProduct.id, url: item.arUrl, type: 'MODEL_3D' }
                    });
                }

                created++;
            }
        }
    });

    res.json({ success: true, created, updated });
}));

/**
 * PUT /api/admin/products/:id

 * Actualizar producto completo con transacción
 */
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
        const productId = parseInt(req.params.id);
        
        // Mapear URLs planas de imágenes/AR al array de multimedia
        mapFlatMediaToRequestMedia(req);

        const data = UpdateProductSchema.parse(req.body);

        // Verificar que el producto existe y pertenece al usuario
        const user = (req as any).user;
        const storeId = user?.storeId;
        const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
        const existingProduct = await prisma.product.findFirst({
            where: {
                id: productId,
                ...(isSuperAdmin ? {} : { storeId }),
            },
            include: {
                variants: true,
                media: true,
            },
        });

        if (!existingProduct) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        // Transaction de actualización
        const updatedProduct = await prisma.$transaction(async (tx) => {
            // 1. Actualizar campos base del producto
            const updateData: any = {};

            if (data.name) {
                updateData.name = data.name;
                // Regenerar slug solo si cambió el nombre
                if (data.name !== existingProduct.name) {
                    updateData.slug = await generateUniqueSlug(data.name, productId);
                }
            }

            if (data.sku) updateData.sku = data.sku;
            if (data.description !== undefined) updateData.description = data.description;
            if (data.category) updateData.category = data.category;
            if (data.subcategory !== undefined) updateData.subcategory = data.subcategory;
            if (data.room !== undefined) updateData.room = data.room;
            if (data.style !== undefined) updateData.style = data.style;
            if (data.tags) updateData.tags = data.tags;
            if (data.isActive !== undefined) updateData.isActive = data.isActive;
            if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
            if (data.featured !== undefined) updateData.isFeatured = data.featured;

            // JSON fields
            if (data.dimensions) {
                updateData.dimensions = {
                    ...data.dimensions,
                    volumeM3: calculateVolume(data.dimensions),
                };
            }
            if (data.materials) updateData.materials = data.materials;
            if (data.warranty) updateData.warranty = data.warranty;
            if (data.logistics) updateData.logistics = data.logistics;
            if (data.seo) updateData.seo = data.seo;

            const product = await tx.product.update({
                where: { id: productId },
                data: updateData,
            });

            // 1.5. Actualizar stockQty en variante por defecto si se envió
            if (data.stockQty !== undefined) {
                const defaultVariant = existingProduct.variants.find(v => v.isDefault) || existingProduct.variants[0];
                if (defaultVariant) {
                    await tx.productVariant.update({
                        where: { id: defaultVariant.id },
                        data: { stock: data.stockQty },
                    });

                    // Recalcular totalStock con el nuevo stock de la variante por defecto
                    const otherVariants = existingProduct.variants.filter(v => v.id !== defaultVariant.id);
                    const totalStock = otherVariants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) + data.stockQty;

                    await tx.productInventory.upsert({
                        where: { productId },
                        update: {
                            totalStock,
                            availableStock: totalStock,
                        },
                        create: {
                            productId,
                            totalStock,
                            availableStock: totalStock,
                            trackStock: true,
                        },
                    });
                }
            }

            // 2. Manejar variantes (si se enviaron)
            if (data.variants && data.variants.length > 0) {
                // Obtener IDs de variantes existentes
                const existingVariantIds = existingProduct.variants.map(v => v.id);
                const updatedVariantIds = data.variants.filter(v => v.id).map(v => v.id);

                // Eliminar variantes que ya no existen
                const variantsToDelete = existingVariantIds.filter(id => !updatedVariantIds.includes(id));
                if (variantsToDelete.length > 0) {
                    await tx.productVariant.deleteMany({
                        where: { id: { in: variantsToDelete } },
                    });
                }

                // Crear o actualizar variantes
                for (const variant of data.variants) {
                    if (variant.id && existingVariantIds.includes(variant.id)) {
                        // Actualizar variante existente
                        await tx.productVariant.update({
                            where: { id: variant.id },
                            data: {
                                sku: variant.sku,
                                name: variant.name,
                                color: variant.color,
                                fabric: variant.fabric,
                                size: variant.size,
                                finish: variant.finish,
                                listPrice: variant.listPrice,
                                salePrice: variant.salePrice,
                                currency: variant.currency,
                                stock: variant.stock,
                                isDefault: variant.isDefault,
                            },
                        });

                        // Actualizar imágenes de variante (eliminar y recrear)
                        await tx.productVariantImage.deleteMany({
                            where: { variantId: variant.id },
                        });

                        if (variant.images.length > 0) {
                            await tx.productVariantImage.createMany({
                                data: variant.images.map((img, idx) => ({
                                    url: img.url,
                                    alt: img.alt || `${data.name || existingProduct.name} - ${variant.name}`,
                                    sortOrder: img.sortOrder || idx,
                                    variantId: variant.id,
                                })),
                            });
                        }
                    } else {
                        // Crear nueva variante
                        await tx.productVariant.create({
                            data: {
                                sku: variant.sku,
                                name: variant.name,
                                color: variant.color,
                                fabric: variant.fabric,
                                size: variant.size,
                                finish: variant.finish,
                                listPrice: variant.listPrice,
                                salePrice: variant.salePrice,
                                currency: variant.currency,
                                stock: variant.stock,
                                isDefault: variant.isDefault,
                                productId,
                                images: {
                                    create: variant.images.map((img, idx) => ({
                                        url: img.url,
                                        alt: img.alt || `${data.name || existingProduct.name} - ${variant.name}`,
                                        sortOrder: img.sortOrder || idx,
                                    })),
                                },
                            },
                        });
                    }
                }
            }

            // 3. Actualizar precios generales
            if (data.pricing) {
                const updateData: any = {};
                if (data.pricing.shippingCost !== undefined) {
                    updateData.shippingCost = data.pricing.shippingCost;
                }
                if (req.body.pricing && 'financingOptions' in req.body.pricing) {
                    updateData.financingOptions = data.pricing.financingOptions;
                }

                await tx.productPricing.upsert({
                    where: { productId },
                    update: updateData,
                    create: {
                        currency: 'ARS',
                        shippingCost: data.pricing.shippingCost ?? null,
                        financingOptions: data.pricing.financingOptions || [],
                        productId,
                    },
                });
            }

            // 4. Actualizar inventario
            if (data.inventory || data.variants) {
                const variants = data.variants || existingProduct.variants;
                const totalStock = variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);

                await tx.productInventory.update({
                    where: { productId },
                    data: {
                        trackStock: data.inventory?.trackStock,
                        allowBackorder: data.inventory?.allowBackorder,
                        lowStockAlert: data.inventory?.lowStockAlert,
                        totalStock,
                        availableStock: totalStock, // Simplificado, en realidad sería: total - reservado
                    },
                });
            }

            // 5. Actualizar media (eliminar y recrear)
            if (data.media) {
                // Eliminar media que no está en la nueva lista
                const newMediaIds = data.media.filter(m => m.id).map(m => m.id);
                await tx.productMedia.deleteMany({
                    where: {
                        productId,
                        id: { notIn: newMediaIds.length > 0 ? newMediaIds as number[] : undefined },
                    },
                });

                // Crear o actualizar media
                for (const media of data.media) {
                    if (media.id) {
                        await tx.productMedia.update({
                            where: { id: media.id },
                            data: {
                                type: media.type as any,
                                url: media.url,
                                alt: media.alt,
                                sortOrder: media.sortOrder,
                                isPrimary: media.isPrimary,
                                mediaFormat: media.mediaFormat as any,
                                documentType: media.documentType as any,
                                title: media.title,
                            },
                        });
                    } else {
                        await tx.productMedia.create({
                            data: {
                                type: media.type as any,
                                url: media.url,
                                alt: media.alt || data.name || existingProduct.name,
                                sortOrder: media.sortOrder,
                                isPrimary: media.isPrimary,
                                mediaFormat: media.mediaFormat as any,
                                documentType: media.documentType as any,
                                title: media.title,
                                productId,
                            },
                        });
                    }
                }
            }

            return product;
        }, {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            maxWait: 5000,
            timeout: 10000,
        });

        // Retornar producto actualizado completo
        const fullProduct = await prisma.product.findUnique({
            where: { id: productId },
            include: {
                variants: { include: { images: true } },
                pricing: true,
                inventory: true,
                media: true,
                store: { select: { name: true, slug: true } },
            },
        });

        res.json({
            success: true,
            message: 'Producto actualizado exitosamente',
            product: fullProduct,
        });

    })
);

/**
 * DELETE /api/admin/products/:id
 * Eliminar producto (soft delete opcional)
 */
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
        const productId = parseInt(req.params.id);
        const user = (req as any).user;
        const storeId = user?.storeId;
        const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

        // Verificar ownership
        const product = await prisma.product.findFirst({
            where: {
                id: productId,
                ...(isSuperAdmin ? {} : { storeId }),
            },
        });

        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        // Soft delete (recomendado) o hard delete
        await prisma.product.update({
            where: { id: productId },
            data: { isActive: false }, // Soft delete
        });

        // Para hard delete, usar la transaction de arriba con delete en cascada

        res.json({
            success: true,
            message: 'Producto eliminado exitosamente',
        });
    })
);

/**
 * GET /api/admin/products
 * Listado de productos para el admin (con filtros de tienda)
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
        const user = (req as any).user;
        const storeId = user?.storeId;
        const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
        if (!storeId && !isSuperAdmin) {
            return res.status(403).json({ error: 'No autorizado' });
        }

        const page = parseInt(req.query.page as string) || 1;
        const limitQuery = req.query.limit as string;
        const limit = limitQuery === 'all' ? 10000 : (parseInt(limitQuery) || 20);
        const search = req.query.search as string;

        const where: any = { ...(isSuperAdmin ? {} : { storeId }), isActive: true };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                take: limit,
                skip: limitQuery === 'all' ? 0 : (page - 1) * limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    variants: {
                        select: {
                            id: true,
                            name: true,
                            salePrice: true,
                            stock: true,
                            isDefault: true,
                        },
                    },
                    pricing: {
                        select: {
                            salePrice: true,
                            listPrice: true,
                            shippingCost: true,
                        },
                    },
                    inventory: {
                        select: { availableStock: true },
                    },
                    media: {
                        select: {
                            id: true,
                            type: true,
                            url: true,
                            isPrimary: true,
                            mediaFormat: true,
                        },
                    },
                },
            }),
            prisma.product.count({ where }),
        ]);

        const mappedProducts = products.map((p) => {
            const defaultVariant = p.variants.find((v) => v.isDefault) || p.variants[0];
            const price = defaultVariant?.salePrice ?? p.pricing?.salePrice ?? 0;
            const stockQty = p.inventory?.availableStock ?? 0;
            const dims = p.dimensions as any;

            // Reconstruir URLs de multimedia desde ProductMedia
            const imageUrl = p.media.find(m => m.type === 'IMAGE' && m.isPrimary)?.url || p.media.find(m => m.type === 'IMAGE')?.url || null;
            const glbUrl = p.media.find(m => m.type === 'MODEL_3D' && m.mediaFormat === 'GLB')?.url || null;
            const usdzUrl = p.media.find(m => m.type === 'MODEL_3D' && m.mediaFormat === 'USDZ')?.url || null;
            const arUrl = p.media.find(m => m.type === 'MODEL_3D' && !m.mediaFormat)?.url || p.media.find(m => m.type === 'MODEL_3D')?.url || null;

            // Inyectar estado lógico inStock
            const inStock = stockQty > 0;

            return {
                ...p,
                price,
                stockQty,
                inStock,
                imageUrl,
                glbUrl,
                usdzUrl,
                arUrl,
                widthCm: dims?.widthCm || null,
                depthCm: dims?.depthCm || null,
                heightCm: dims?.heightCm || null,
            };
        });

        res.json({
            items: mappedProducts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    })
);

export default router;
