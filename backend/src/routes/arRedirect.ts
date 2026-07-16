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

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true, media: { where: { type: 'MODEL_3D' } } },
  });

  if (!product || product.media.length === 0) {
    throw Errors.notFound("Product or AR model");
  }

  // Find glb and usdz from media array
  const glbMedia = product.media.find(m => m.url.endsWith('.glb'));
  const usdzMedia = product.media.find(m => m.url.endsWith('.usdz'));

  const glbUrl = glbMedia?.url || product.media[0]?.url;
  const usdzUrl = usdzMedia?.url || null;

  const host = req.headers.host || "localhost:3001";
  const cleanGlbUrl = replaceLocalhost(glbUrl, host);
  const cleanUsdzUrl = usdzUrl ? replaceLocalhost(usdzUrl, host) : null;

  const userAgent = req.headers["user-agent"] || "";
  const isIOS = /iphone|ipad|ipod/i.test(userAgent.toLowerCase());
  const isAndroid = /android/i.test(userAgent);

  if (isIOS && cleanUsdzUrl) {
    // iOS auto-launches Quick Look directly from the scanned QR code when redirected to a .usdz file
    res.redirect(cleanUsdzUrl);
    return;
  }

  if (isAndroid && cleanGlbUrl) {
    // Android auto-launches Scene Viewer when redirected to its https viewer URL
    const sceneViewerUrl = `https://arvr.google.com/scene-viewer/1.0?file=${encodeURIComponent(cleanGlbUrl)}&mode=ar_preferred&title=${encodeURIComponent(product.name)}`;
    res.redirect(sceneViewerUrl);
    return;
  }

  // Redirect to the AR page with clean params
  const siteUrl = env.SITE_URL || "http://localhost:3000";
  const redirectUrl = new URL(`${siteUrl}/ar`);
  redirectUrl.searchParams.set("glb", cleanGlbUrl);

  // Sanitize product name to prevent XSS
  redirectUrl.searchParams.set("title", encodeURIComponent(product.name));

  if (cleanUsdzUrl) redirectUrl.searchParams.set("usdz", cleanUsdzUrl);

  res.redirect(redirectUrl.toString());
}));

export default router;
