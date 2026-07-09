import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { Errors } from '../errors/AppError.js';
import { catalogService } from '../services/CatalogService.js';
import type { AuthenticatedRequest } from '../lib/auth.js';
import { UserRole } from '@prisma/client';

/**
 * StoreController - Controlador para gestión de tiendas
 */

// Schema de validación para settings
const storeSettingsSchema = {
  slug: (val: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(val),
};

export class StoreController {
  /**
   * PUT /api/stores/:id/settings
   * Actualizar configuración de la tienda (slug, WhatsApp, logo, contacto)
   */
  async updateSettings(req: Request, res: Response): Promise<void> {
    const storeId = parseInt(req.params.id);

    if (isNaN(storeId)) {
      throw Errors.validation('Invalid store ID');
    }

    const user = (req as AuthenticatedRequest).user!;

    // Verificar acceso
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { owner: true },
    }) as any;

    if (!store) {
      throw Errors.notFound('Store');
    }

    // Solo ADMIN o usuarios de la tienda pueden modificar
    const isStoreUser = store.ownerId === user.id;
    if (user.role !== UserRole.SUPER_ADMIN && !isStoreUser) {
      throw Errors.forbidden('Access denied to this store');
    }

    // Extraer campos permitidos del body
    const {
      slug,
      name,
      description,
      logoUrl,
      whatsapp,
      whatsappNumber,
      phone,
      email,
      website,
      address,
      city,
      province,
      country,
      socialInstagram,
      socialFacebook,
    } = req.body;

    // Validar slug si se proporciona
    if (slug !== undefined) {
      if (!storeSettingsSchema.slug(slug)) {
        throw Errors.validation(
          'Invalid slug format. Use only lowercase letters, numbers, and hyphens. Example: muebles-cordoba'
        );
      }

      // Verificar que el slug no esté en uso por otra tienda
      const existing = await prisma.store.findFirst({
        where: { slug, id: { not: storeId } },
      });

      if (existing) {
        throw Errors.conflict('Slug is already in use by another store');
      }
    }

    // Validar WhatsApp (debe ser numérico, opcionalmente con + al inicio)
    if (whatsappNumber !== undefined && whatsappNumber) {
      const phoneRegex = /^\+?\d{10,15}$/;
      if (!phoneRegex.test(whatsappNumber)) {
        throw Errors.validation(
          'Invalid WhatsApp number. Use format: +5491234567890 or 5491234567890'
        );
      }
    }

    // Validar email si se proporciona
    if (email !== undefined && email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw Errors.validation('Invalid email format');
      }
    }

    // Validar website si se proporciona
    if (website !== undefined && website) {
      try {
        new URL(website);
      } catch {
        throw Errors.validation('Invalid website URL. Must include http:// or https://');
      }
    }

    // Construir objeto de actualización
    const updateData: any = {};

    if (slug !== undefined) updateData.slug = slug;
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (whatsappNumber !== undefined) updateData.whatsappNumber = whatsappNumber;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (website !== undefined) updateData.website = website;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (province !== undefined) updateData.province = province;
    if (country !== undefined) updateData.country = country;
    if (socialInstagram !== undefined) updateData.socialInstagram = socialInstagram;
    if (socialFacebook !== undefined) updateData.socialFacebook = socialFacebook;

    // Actualizar tienda
    const updatedStore = await prisma.store.update({
      where: { id: storeId },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Store settings updated successfully',
      data: updatedStore,
    });
  }

  /**
   * GET /api/stores/:id/settings
   * Obtener configuración actual de la tienda
   */
  async getSettings(req: Request, res: Response): Promise<void> {
    const storeId = parseInt(req.params.id);

    if (isNaN(storeId)) {
      throw Errors.validation('Invalid store ID');
    }

    const user = (req as AuthenticatedRequest).user!;

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { owner: true },
    }) as any;

    if (!store) {
      throw Errors.notFound('Store');
    }

    // Verificar acceso
    const isStoreUser = store.ownerId === user.id;
    if (user.role !== UserRole.SUPER_ADMIN && !isStoreUser) {
      throw Errors.forbidden('Access denied to this store');
    }

    res.json({
      success: true,
      data: store,
    });
  }

  /**
   * POST /api/stores/:id/generate-slug
   * Generar slug automáticamente desde el nombre
   */
  async generateSlug(req: Request, res: Response): Promise<void> {
    const storeId = parseInt(req.params.id);

    if (isNaN(storeId)) {
      throw Errors.validation('Invalid store ID');
    }

    const user = (req as AuthenticatedRequest).user!;

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { owner: true },
    }) as any;

    if (!store) {
      throw Errors.notFound('Store');
    }

    // Verificar acceso
    const isStoreUser = store.ownerId === user.id;
    if (user.role !== UserRole.SUPER_ADMIN && !isStoreUser) {
      throw Errors.forbidden('Access denied to this store');
    }

    // Generar slug base
    let baseSlug = catalogService.generateSlug(store.name);

    // Verificar disponibilidad y agregar sufijo numérico si es necesario
    let slug = baseSlug;
    let counter = 1;

    while (!(await catalogService.isSlugAvailable(slug, storeId))) {
      slug = `${baseSlug}-${counter}`;
      counter++;

      // Evitar bucle infinito
      if (counter > 100) {
        throw Errors.internal('Could not generate unique slug');
      }
    }

    res.json({
      success: true,
      data: {
        generatedSlug: slug,
        available: true,
      },
    });
  }
}

// Exportar singleton
export const storeController = new StoreController();
