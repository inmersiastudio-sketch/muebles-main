import { Router } from "express";
import { downloadGLB } from "../lib/meshy.js";

const router = Router();

/**
 * GET /api/proxy/glb?url=...
 * Proxy endpoint to serve GLB files from Meshy with CORS headers
 * This solves CORS issues when loading models in model-viewer
 */
router.get("/glb", async (req, res) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "Missing 'url' query parameter" });
    }

    // Validate it's a Meshy URL (security)
    if (!url.startsWith("https://assets.meshy.ai/")) {
      return res.status(400).json({ error: "Invalid URL - only Meshy assets allowed" });
    }

    // Download GLB from Meshy
    const glbBuffer = await downloadGLB(url);

    // Set CORS headers and content type
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Content-Type", "model/gltf-binary");
    res.setHeader("Content-Length", glbBuffer.length.toString());
    res.setHeader("Cache-Control", "public, max-age=86400"); // Cache 1 day

    res.send(glbBuffer);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("GLB proxy error:", error);
    // Return the upstream status if available (e.g. 403 expired URL, 404 not found)
    const upstreamMatch = msg.match(/Failed to download GLB: (\d{3})/);
    const statusCode = upstreamMatch ? parseInt(upstreamMatch[1]) : 500;
    res.status(statusCode).json({ error: "Failed to fetch GLB file", detail: msg });
  }
});

// Handle OPTIONS preflight
router.options("/glb", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.sendStatus(204);
});

export default router;
