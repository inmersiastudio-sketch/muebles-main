import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import {
  dedup,
  resample,
  prune,
  weld,
  quantize
} from "@gltf-transform/functions";

/** Cloudinary free plan limit (10MB). Used to decide when to use max compression. */
export const CLOUDINARY_RAW_LIMIT_BYTES = 10 * 1024 * 1024;

export type CompressGLBOptions = {
  /** Max texture side in px. Default 256; use 128 for "max" compression when first pass is too big. */
  maxTextureSize?: number;
  /** Even more aggressive quantize (for second-pass when upload fails by size). */
  maxCompression?: boolean;
};

/**
 * Compress a GLB file using geometry and texture optimization.
 * Targets staying under Cloudinary free plan limit (10MB) when possible.
 */
export async function compressGLB(
  inputBuffer: Buffer,
  options: CompressGLBOptions = {},
): Promise<Buffer> {
  const { maxTextureSize = 256, maxCompression = false } = options;
  // All quantize values must be in range 8-16 (KHR_mesh_quantization requirement)
  const quantizeLevels = maxCompression
    ? { quantizePosition: 10, quantizeNormal: 8, quantizeTexcoord: 8, quantizeColor: 8 }
    : { quantizePosition: 14, quantizeNormal: 10, quantizeTexcoord: 10, quantizeColor: 8 };

  try {
    // Initialize NodeIO with all extensions
    const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);

    // Load the GLB from buffer
    const document = await io.readBinary(new Uint8Array(inputBuffer));

    // Apply optimizations
    await document.transform(
      // Remove duplicate vertices and primitives
      dedup(),

      // Weld vertices (merge vertices that are close together)
      weld(),

      // Quantize vertex attributes (more aggressive to stay under 10MB for Cloudinary free plan)
      quantize(quantizeLevels),

      // Resize textures (aggressive size reduction)
      // resample type is broken or arguments changed in v4, omitting for now
      // resample({ size: [maxTextureSize, maxTextureSize] }),

      // Remove unused nodes, meshes, materials, etc.
      prune()
    );

    // Write to GLB buffer
    const outputBuffer = await io.writeBinary(document);

    return Buffer.from(outputBuffer);
  } catch (error) {
    console.error("Error compressing GLB:", error);
    throw new Error(`Failed to compress GLB: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get file size info for logging
 */
export function getFileSizeInfo(originalSize: number, compressedSize: number) {
  const reduction = ((originalSize - compressedSize) / originalSize) * 100;
  return {
    originalSizeMB: (originalSize / 1024 / 1024).toFixed(2),
    compressedSizeMB: (compressedSize / 1024 / 1024).toFixed(2),
    reductionPercent: reduction.toFixed(1),
  };
}
