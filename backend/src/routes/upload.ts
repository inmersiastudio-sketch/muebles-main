import path from "path";
import { Router } from "express";
import multer from "multer";
import { requireRole } from "../lib/auth.js";
import { uploadImage, uploadGLB } from "../lib/cloudinary.js";
import { uploadGLBToS3 } from "../lib/s3.js";
import { UserRole } from "@prisma/client";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

const ALLOWED_IMAGE_MIMES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const ALLOWED_MODEL_MIMES = ["model/gltf-binary", "model/gltf+json", "application/octet-stream"];

// Configure multer for memory storage with MIME validation
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter: (_req, file, cb) => {
    if (file.fieldname === "file") {
      const isImage = ALLOWED_IMAGE_MIMES.includes(file.mimetype);
      const isModel = ALLOWED_MODEL_MIMES.includes(file.mimetype) || file.originalname.endsWith(".glb") || file.originalname.endsWith(".usdz");
      if (isImage || isModel) {
        cb(null, true);
      } else {
        cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`));
      }
    } else {
      cb(null, true);
    }
  },
});

// Upload image
router.post("/image", requireRole([UserRole.SUPER_ADMIN, UserRole.STORE_OWNER]), upload.single("file"), asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const result = await uploadImage(req.file.buffer);
    return res.json({ url: result.url, publicId: result.publicId });
  })
);

// Upload GLB/USDZ model
router.post("/model", requireRole([UserRole.SUPER_ADMIN, UserRole.STORE_OWNER]), upload.single("file"), asyncHandler(async (req, res) => {
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
  })
);

export default router;
