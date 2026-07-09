import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// ============================================
// SCHEMAS ZOD VALIDACIÓN
// ============================================

const VariantSchema = z.object({
    id: z.string().optional(), // Para updates
    sku: z.string().min(1),
    name: z.string().min(1),
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
    sku: z.string().min(1),
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
        widthCm: z.number().positive(),
        heightCm: z.number().positive(),
        depthCm: z.number().positive(),
        weightKg: z.number().positive(),
        packageDimensions: z.object({
            widthCm: z.number().positive(),
            heightCm: z.number().positive(),
            depthCm: z.number().positive(),
            weightKg: z.number().positive(),
        }).optional(),
    }).optional(),

    materials: z.object({
        primary: z.string().min(1),
        structure: z.string().optional(),
        upholstery: z.object({
            fabric: z.string(),
            composition: z.string(),
            cleaningCode: z.enum(['W', 'S', 'WS', 'X']),
        }).optional(),
        legs: z.string().optional(),
        finish: z.string(),
        certifications: z.array(z.string()).default([]),
    }).optional(),

    warranty: z.object({
        type: z.enum(['factory', 'extended', 'none']),
        durationMonths: z.number().int().positive(),
        coverage: z.string(),
        termsUrl: z.string().url().optional(),
        conditions: z.array(z.string()).default([]),
        exclusions: z.array(z.string()).default([]),
    }).optional(),

    logistics: z.object({
        deliveryTimeDays: z.object({
            min: z.number().int().positive(),
            max: z.number().int().positive(),
        }),
        deliveryType: z.enum(['home', 'branch', 'pickup', 'multiple']),
        shippingZones: z.array(z.string()).default(['CABA', 'GBA']),
        assembly: z.object({
            included: z.boolean(),
            price: z.number().optional(),
            estimatedTimeMinutes: z.number().int().optional(),
            difficulty: z.enum(['easy', 'medium', 'professional']),
            manualUrl: z.string().url().optional(),
        }),
        packaging: z.object({
            piecesCount: z.number().int().positive(),
            specialHandling: z.boolean(),
        }),
    }).optional(),

    // SEO
    seo: z.object({
        metaTitle: z.string().max(70).optional(),
        metaDescription: z.string().max(160).optional(),
        keywords: z.array(z.string()).default([]),
    }).optional(),

    // Relaciones
    variants: z.array(VariantSchema).min(1).optional(),
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

// ============================================
// RUTAS ADMIN
// ============================================

/**
 * POST /api/admin/products
 * Crear producto completo con transacción
 */
router.post('/', async (req: Request, res: Response) => {
    try {
        // 1. Validar input
        const data = CreateProductSchema.parse(req.body);

        // 2. Obtener store del usuario autenticado (middleware de auth)
        // Usamos any temporalmente para evitar problemas de tipos de req.user
        const storeId = (req as any).user?.storeId;
        if (!storeId) {
            return res.status(403).json({ error: 'No tienes una tienda asociada' });
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

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Datos inválidos',
                details: error.errors,
            });
        }

        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Error al crear el producto' });
    }
});

/**
 * PUT /api/admin/products/:id
 * Actualizar producto completo con transacción
 */
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const productId = parseInt(req.params.id);
        const data = UpdateProductSchema.parse(req.body);

        // Verificar que el producto existe y pertenece al usuario
        const storeId = (req as any).user?.storeId;
        const existingProduct = await prisma.product.findFirst({
            where: {
                id: productId,
                storeId,
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
                await tx.productPricing.upsert({
                    where: { productId },
                    update: {
                        shippingCost: data.pricing.shippingCost,
                        financingOptions: data.pricing.financingOptions,
                    },
                    create: {
                        currency: 'ARS',
                        shippingCost: data.pricing.shippingCost,
                        financingOptions: data.pricing.financingOptions,
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

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                error: 'Datos inválidos',
                details: error.errors,
            });
        }

        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
});

/**
 * DELETE /api/admin/products/:id
 * Eliminar producto (soft delete opcional)
 */
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const productId = parseInt(req.params.id);
        const storeId = (req as any).user?.storeId;

        // Verificar ownership
        const product = await prisma.product.findFirst({
            where: {
                id: productId,
                storeId,
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

    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
});

/**
 * GET /api/admin/products
 * Listado de productos para el admin (con filtros de tienda)
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const storeId = (req as any).user?.storeId;
        if (!storeId) {
            return res.status(403).json({ error: 'No autorizado' });
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const search = req.query.search as string;

        const where: any = { storeId };

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
                skip: (page - 1) * limit,
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
                    inventory: {
                        select: { availableStock: true },
                    },
                    media: {
                        where: { isPrimary: true },
                        take: 1,
                        select: { url: true },
                    },
                },
            }),
            prisma.product.count({ where }),
        ]);

        res.json({
            items: products,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });

    } catch (error) {
        console.error('Error fetching admin products:', error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

export default router;
