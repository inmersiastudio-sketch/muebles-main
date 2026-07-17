import { Router } from "express";
import { z } from "zod";
import { validateGlbScale } from "../lib/scaleValidator.js";
import { requireAuth, requireRole, type AuthenticatedRequest } from "../lib/auth.js";
import { UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { rescaleGLB } from "../lib/glb-scaler.js";
import { compressGLB, getFileSizeInfo } from "../lib/glb-compressor.js";
import { validateGLBScale } from "../lib/glb-validator.js";
import { uploadGLBToS3, deleteFromS3 } from "../lib/s3.js";
import { uploadGLB, deleteAsset } from "../lib/cloudinary.js";
import { env } from "../config/env.js";

const router = Router();

// Concurrency control for active rescale processes
const processingRescales = new Set<number>();
const MAX_GLB_BYTES = 50 * 1024 * 1024;
const DOWNLOAD_TIMEOUT_MS = 30_000;

const rescaleBodySchema = z.object({
  productId: z.number().int().positive(),
}).strict();

const dimensionsSchema = z.object({
  widthCm: z.number().positive().optional(),
  heightCm: z.number().positive().optional(),
  depthCm: z.number().positive().optional(),
}).passthrough();

const bodySchema = z
  .object({
    file: z.string().min(1),
    widthCm: z.number().optional(),
    depthCm: z.number().optional(),
    heightCm: z.number().optional(),
    tolerance: z.number().optional().default(0.05),
  })
  .refine((data) => data.widthCm || data.depthCm || data.heightCm, {
    message: "Se requiere al menos una dimensión (widthCm/depthCm/heightCm)",
  });

type Suggestion = {
  dimension: "width" | "depth" | "height";
  factor: number;
  projectedSizeCm: { width: number; depth: number; height: number };
  projectedDiffs: { width: number | null; depth: number | null; height: number | null };
};

function computeSuggestion(
  sizeCm: { width: number; depth: number; height: number },
  expected: { width?: number; depth?: number; height?: number },
): Suggestion | null {
  const priority: Array<"width" | "depth" | "height"> = ["width", "depth", "height"];
  const picked = priority.find((key) => expected[key] !== undefined);
  if (!picked) return null;
  const actual = sizeCm[picked];
  const target = expected[picked]!;
  if (!actual || actual === 0) return null;
  const factor = target / actual;
  const projectedSizeCm = {
    width: Math.round(sizeCm.width * factor * 10) / 10,
    depth: Math.round(sizeCm.depth * factor * 10) / 10,
    height: Math.round(sizeCm.height * factor * 10) / 10,
  };
  const projectedDiffs = {
    width: expected.width ? Math.abs(projectedSizeCm.width - expected.width) / expected.width : null,
    depth: expected.depth ? Math.abs(projectedSizeCm.depth - expected.depth) / expected.depth : null,
    height: expected.height ? Math.abs(projectedSizeCm.height - expected.height) / expected.height : null,
  };
  return { dimension: picked, factor, projectedSizeCm, projectedDiffs };
}

router.post("/validate-scale", requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.STORE_OWNER]), async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Payload inválido", details: parsed.error.flatten() });
  }

  const { file, widthCm, depthCm, heightCm, tolerance } = parsed.data;

  try {
    const result = await validateGlbScale({ file, width: widthCm, depth: depthCm, height: heightCm, tolerance });
    const suggestion = computeSuggestion(result.sizeCm, result.expected);
    return res.json({
      ok: result.ok,
      sizeCm: result.sizeCm,
      expected: result.expected,
      diffs: result.diffs,
      tolerance: result.tolerance,
      suggestion,
    });
  } catch (err) {
    console.error("Scale validation error:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: "No se pudo validar el modelo", detail: errorMessage });
  }
});

// Helper for atomic file upload using AWS S3 / Cloudinary fallback
type UploadedFile = {
  url: string;
  provider: "s3" | "cloudinary";
  storageId: string;
};

async function uploadFile(buffer: Buffer, fileKey: string): Promise<UploadedFile> {
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_BUCKET_NAME) {
    const result = await uploadGLBToS3(buffer, fileKey);
    return { url: result.url, provider: "s3", storageId: result.key };
  }

  const result = await uploadGLB(buffer, {
    public_id: fileKey.replace(/\.glb$/i, ""),
    overwrite: false,
    resource_type: "raw",
  });
  return { url: result.url, provider: "cloudinary", storageId: result.publicId };
}

async function deleteUploadedFile(file: UploadedFile): Promise<void> {
  if (file.provider === "s3") {
    await deleteFromS3(file.storageId);
    return;
  }
  await deleteAsset(file.storageId, "raw");
}

function assertAllowedModelUrl(rawUrl: string): URL {
  const url = new URL(rawUrl);
  const allowedHosts = new Set<string>();

  if (env.AWS_BUCKET_NAME && env.AWS_REGION) {
    allowedHosts.add(`${env.AWS_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com`);
  }
  if (env.CLOUDINARY_CLOUD_NAME) {
    allowedHosts.add("res.cloudinary.com");
  }
  if (env.NODE_ENV !== "production") {
    allowedHosts.add(new URL(env.API_BASE_URL).hostname);
    allowedHosts.add("localhost");
    allowedHosts.add("127.0.0.1");
  }

  const isCloudinaryAsset =
    url.hostname === "res.cloudinary.com" &&
    Boolean(env.CLOUDINARY_CLOUD_NAME) &&
    url.pathname.startsWith(`/${env.CLOUDINARY_CLOUD_NAME}/`);
  const isAllowed = allowedHosts.has(url.hostname) &&
    (url.hostname !== "res.cloudinary.com" || isCloudinaryAsset);

  if (!isAllowed || (env.NODE_ENV === "production" && url.protocol !== "https:")) {
    throw new Error("La URL del modelo no pertenece a un almacenamiento autorizado.");
  }

  return url;
}

async function downloadModelBuffer(rawUrl: string): Promise<Buffer> {
  const url = assertAllowedModelUrl(rawUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal, redirect: "error" });
    if (!response.ok || !response.body) {
      throw new Error(`No se pudo descargar el modelo (${response.status}).`);
    }

    const declaredSize = Number(response.headers.get("content-length"));
    if (Number.isFinite(declaredSize) && declaredSize > MAX_GLB_BYTES) {
      throw new Error("El archivo del modelo excede el tamaño máximo permitido de 50 MB.");
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_GLB_BYTES) {
        await reader.cancel();
        throw new Error("El archivo del modelo excede el tamaño máximo permitido de 50 MB.");
      }
      chunks.push(value);
    }

    return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)), totalBytes);
  } finally {
    clearTimeout(timeout);
  }
}

// POST /api/ar/rescale - Secure re-scaling of product 3D model
router.post("/rescale", requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.STORE_OWNER]), async (req, res) => {
  const parsedBody = rescaleBodySchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({ error: "Se requiere únicamente un productId entero positivo." });
  }
  const { productId } = parsedBody.data;

  // 1. Concurrency control lock
  if (processingRescales.has(productId)) {
    return res.status(409).json({ error: "Este producto ya está siendo procesado o re-escalado. Intentá de nuevo en unos momentos." });
  }
  processingRescales.add(productId);

  try {
    // 2. Fetch product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado." });
    }

    // 3. Ownership check
    const user = (req as AuthenticatedRequest).user;
    if (!user) {
      return res.status(401).json({ error: "Sesión no válida." });
    }
    if (user.role === UserRole.STORE_OWNER && product.storeId !== user.storeId) {
      return res.status(403).json({ error: "Acceso denegado. No tenés permisos sobre los productos de esta tienda." });
    }

    // 4. Validate dimensions JSON with Zod
    if (!product.dimensions) {
      return res.status(400).json({ error: "El producto no tiene dimensiones configuradas." });
    }

    const parsedDims = dimensionsSchema.safeParse(product.dimensions);
    if (!parsedDims.success || !(parsedDims.data.widthCm || parsedDims.data.heightCm || parsedDims.data.depthCm)) {
      return res.status(400).json({ error: "El producto no tiene dimensiones de ancho, alto o profundidad válidas mayor a cero en la base de datos." });
    }

    // 5. Fetch 3D GLB model record
    const glbMedia = await prisma.productMedia.findFirst({
      where: { productId, type: "MODEL_3D", mediaFormat: "GLB" },
    });

    if (!glbMedia) {
      return res.status(404).json({ error: "No se encontró ningún modelo 3D GLB asociado a este producto." });
    }

    // 6. Descargar únicamente desde los almacenamientos configurados, con timeout y límite real.
    const downloadUrl = glbMedia.url;
    console.log(`[rescale] Downloading GLB model for scaling from: ${downloadUrl}`);
    const originalBuffer = await downloadModelBuffer(downloadUrl);

    // 7. Perform physical scaling and centering (idempotent operation)
    console.log(`[rescale] Applying physical scale to GLB for product ${productId}...`);
    const scaleResult = await rescaleGLB(originalBuffer, parsedDims.data);

    // 8. Compress the scaled buffer
    console.log(`[rescale] Compressing scaled GLB buffer...`);
    const compressedBuffer = await compressGLB(scaleResult.buffer);

    // 9. Run final bounding box verification on the compressed buffer
    console.log(`[rescale] Validating final compressed scale buffer...`);
    const finalValidation = await validateGLBScale(compressedBuffer);

    let isArVerified = false;
    if (finalValidation.valid && finalValidation.boundingBox) {
      const finalWidth = finalValidation.boundingBox.width * 100;
      const finalHeight = finalValidation.boundingBox.height * 100;
      const finalDepth = finalValidation.boundingBox.depth * 100;

      const diffW = parsedDims.data.widthCm ? Math.abs(finalWidth - parsedDims.data.widthCm) / parsedDims.data.widthCm : 0;
      const diffH = parsedDims.data.heightCm ? Math.abs(finalHeight - parsedDims.data.heightCm) / parsedDims.data.heightCm : 0;
      const diffD = parsedDims.data.depthCm ? Math.abs(finalDepth - parsedDims.data.depthCm) / parsedDims.data.depthCm : 0;

      isArVerified = diffW <= 0.05 && diffH <= 0.05 && diffD <= 0.05;
    }

    // 10. Upload the new GLB with versioned timestamped key to prevent caches
    const newFileKey = `product_${productId}_3d_model_scaled_${Date.now()}.glb`;
    const uploadResult = await uploadFile(compressedBuffer, newFileKey);

    try {
      await prisma.$transaction([
        prisma.productMedia.update({
          where: { id: glbMedia.id },
          data: { url: uploadResult.url, mediaFormat: "GLB" },
        }),
        prisma.product.update({
          where: { id: productId },
          data: {
            dimensions: {
              ...parsedDims.data,
              arVerified: isArVerified,
            },
          },
        }),
      ]);
    } catch (databaseError) {
      await deleteUploadedFile(uploadResult).catch((cleanupError) => {
        console.warn("[rescale] No se pudo limpiar el archivo nuevo tras el rollback:", cleanupError);
      });
      throw databaseError;
    }

    // Se conserva la versión anterior para rollback. Su limpieza debe hacerla un job de retención.
    console.info(`[rescale] Modelo anterior conservado temporalmente para rollback: ${glbMedia.url}`);

    return res.json({
      success: true,
      arVerified: isArVerified,
      scaleFactor: scaleResult.scaleFactor,
      beforeCm: scaleResult.beforeCm,
      afterCm: scaleResult.afterCm,
      targetCm: scaleResult.targetCm,
      diffs: scaleResult.diffs,
      warnings: scaleResult.warnings,
      tolerance: 0.05,
      sourceDimension: scaleResult.sourceDimension,
    });
  } catch (err) {
    console.error(`[rescale] Failed to rescale product ${productId}:`, err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: "Error en el servidor al re-escalar el modelo 3D.", details: errorMessage });
  } finally {
    processingRescales.delete(productId);
  }
});

export default router;
