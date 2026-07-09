import express from "express";
import { prisma } from "../lib/prisma.js";
import { rateLimit } from "../middleware/rateLimit.js";

const router = express.Router();

const arViewLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  message: "Too many AR events, slow down",
});

router.post("/ar-view", arViewLimiter, async (req, res) => {
  const { productId, slug, source } = req.body || {};

  if (!productId && !slug) {
    return res.status(400).json({ error: "productId or slug required" });
  }

  try {
    const product = await prisma.product.findFirst({
      where: productId ? { id: Number(productId) } : { slug },
      select: { id: true, storeId: true },
    });

    if (!product) return res.status(404).json({ error: "Product not found" });

    const src = source?.toString().toUpperCase() || "UNKNOWN";

    await prisma.productView.create({
      data: {
        productId: product.id,
        sessionId: "ar-view-" + Date.now().toString(),
        source: src,
      },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("ar-view error", err);
    res.status(500).json({ error: "Cannot save ar-view" });
  }
});

export default router;