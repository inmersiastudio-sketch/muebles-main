import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { Errors } from "../errors/AppError.js";

/**
 * AR Redirect Routes
 * Short URLs for AR viewer: /api/ar/{productId}
 * Redirects to AR page with model URLs
 */

const router = Router();

function replaceLocalhost(url: string | null | undefined, host: string): string {
  if (!url) return "";
  const cleanHost = host.split(":")[0];
  if (cleanHost !== "localhost" && cleanHost !== "127.0.0.1") {
    return url
      .replace(/localhost:3001/g, host)
      .replace(/127\.0\.0\.1:3001/g, host)
      .replace(/localhost:3000/g, host.replace(":3001", ":3000"))
      .replace(/127\.0\.0\.1:3000/g, host.replace(":3001", ":3000"));
  }
  return url;
}

// GET /api/short/ar/:productId - Redirect to AR viewer
router.get("/:productId", asyncHandler(async (req, res) => {
  const productId = Number(req.params.productId);

  if (Number.isNaN(productId)) {
    throw Errors.validation("Invalid product ID");
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, isActive: true, store: { isActive: true } },
    select: {
      id: true,
      name: true,
      dimensions: true,
      media: { where: { type: "MODEL_3D" } },
    },
  });

  if (!product || product.media.length === 0) {
    throw Errors.notFound("Product or AR model");
  }

  const glbMedia = product.media.find((media) => media.mediaFormat === "GLB");
  if (!glbMedia) {
    throw Errors.notFound("Product GLB model");
  }
  const glbUrl = glbMedia.url;

  const host = req.headers.host || "localhost:3001";
  const cleanGlbUrl = replaceLocalhost(glbUrl, host);
  const dimensions = product.dimensions && typeof product.dimensions === "object" && !Array.isArray(product.dimensions)
    ? product.dimensions as Record<string, unknown>
    : {};

  // Redirect to the unified AR landing page with clean params (no direct USDZ/SceneViewer launch)
  const siteUrl = env.SITE_URL || "http://localhost:3000";
  const redirectUrl = new URL(`${siteUrl}/ar`);
  redirectUrl.searchParams.set("glb", cleanGlbUrl);
  redirectUrl.searchParams.set("title", product.name);
  redirectUrl.searchParams.set("verified", dimensions.arVerified === true ? "true" : "false");

  res.redirect(redirectUrl.toString());
}));

export default router;
