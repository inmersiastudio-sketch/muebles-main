import path from "path";
import { Router } from "express";
import multer from "multer";
import { requireRole } from "../lib/auth.js";
import { uploadImage, uploadGLB } from "../lib/cloudinary.js";
import { uploadGLBToS3 } from "../lib/s3.js";
import { UserRole } from "@prisma/client";

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

// Upload image
router.post("/image", requireRole([UserRole.SUPER_ADMIN, UserRole.STORE_OWNER]), upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const result = await uploadImage(req.file.buffer);
    return res.json({ url: result.url, publicId: result.publicId });
  } catch (error) {
    console.error("Image upload error:", error);
    return res.status(500).json({ error: "Failed to upload image" });
  }
});

// Upload GLB/USDZ model
router.post("/model", requireRole([UserRole.SUPER_ADMIN, UserRole.STORE_OWNER]), upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Try S3 first for models
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_BUCKET_NAME) {
      const safeName = path.basename(req.file.originalname).replace(/[^a-zA-Z0-9._-]/g, "_");
      const fileKey = `models/${Date.now()}_${safeName}`;
      const result = await uploadGLBToS3(req.file.buffer, fileKey);
      return res.json({ url: result.url, publicId: result.publicId });
    }

    // Fallback to Cloudinary
    const result = await uploadGLB(req.file.buffer);
    return res.json({ url: result.url, publicId: result.publicId });
  } catch (error) {
    console.error("Model upload error:", error);
    return res.status(500).json({ error: "Failed to upload model" });
  }
});

export default router;
