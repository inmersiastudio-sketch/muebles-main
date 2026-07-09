import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";

// Initialize Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(fileBuffer: Buffer, folder = "products"): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        format: "webp",
        transformation: [
          { width: 1200, height: 900, crop: "limit" },
          { quality: "auto:good" },
        ],
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Upload failed"));
        } else {
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      },
    );

    uploadStream.end(fileBuffer);
  });
}

/** Cloudinary free plan raw file limit (10MB). Used for clear error messages. */
const CLOUDINARY_RAW_LIMIT_MB = 10;

export type UploadGLBOptions = {
  folder?: string;
  public_id?: string;
  overwrite?: boolean;
  resource_type?: "raw" | "auto";
};

/**
 * Upload GLB to Cloudinary (resource_type: raw).
 * Uses upload_stream only; upload_chunked_stream in the SDK has a callback bug
 * ("callback is not a function") so we rely on compression to stay under 10MB.
 */
export async function uploadGLB(
  fileBuffer: Buffer,
  folderOrOptions: string | UploadGLBOptions = "models",
): Promise<{ url: string; publicId: string }> {
  const options: Record<string, unknown> =
    typeof folderOrOptions === "string"
      ? { folder: folderOrOptions, resource_type: "raw" }
      : { folder: "models", resource_type: "raw", ...folderOrOptions };

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder as string,
        resource_type: (options.resource_type as "raw") || "raw",
        ...(options.public_id && { public_id: options.public_id as string }),
        ...(options.overwrite !== undefined && { overwrite: Boolean(options.overwrite) }),
      },
      (error, result) => {
        if (error || !result) {
          reject(normalizeUploadError(error, fileBuffer.length));
        } else {
          // Use the secure_url as-is since public_id already has .glb extension
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      },
    );

    uploadStream.end(fileBuffer);
  });
}

/** Returns true if the error is due to Cloudinary file size limit (so caller can retry with stronger compression). */
export function isFileTooLargeError(error: unknown): boolean {
  const message = error && typeof (error as { message?: string }).message === "string" ? (error as { message: string }).message : String(error);
  return (
    message.includes("File size too large") ||
    message.includes("too large") ||
    message.includes("supera el límite") ||
    /Maximum is \d+/.test(message)
  );
}

function normalizeUploadError(error: unknown, sizeBytes: number): Error {
  const message = error && typeof (error as { message?: string }).message === "string" ? (error as { message: string }).message : String(error);
  if (message.includes("File size too large") || message.includes("too large") || /Maximum is \d+/.test(message)) {
    const sizeMB = (sizeBytes / 1024 / 1024).toFixed(1);
    return new Error(
      `El archivo GLB supera el límite de Cloudinary (máx. ${CLOUDINARY_RAW_LIMIT_MB} MB en plan gratuito). Tamaño: ${sizeMB} MB. Comprime más el modelo o usa un plan superior.`,
    );
  }
  return error instanceof Error ? error : new Error(message);
}

export async function deleteAsset(publicId: string, resourceType: "image" | "raw" = "image") {
  try {
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return result;
  } catch (error) {
    console.error("Error deleting asset from Cloudinary:", error);
    throw error;
  }
}
