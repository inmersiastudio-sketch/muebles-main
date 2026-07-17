import { NodeIO, type Document } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { mat4, vec3 } from "gl-matrix";

export interface Dimensions {
  width: number;
  depth: number;
  height: number;
}

export interface DimensionDiffs {
  width: number | null;
  depth: number | null;
  height: number | null;
}

export interface RescaleResult {
  buffer: Buffer;
  scaleFactor: number;
  sourceDimension: "width" | "height" | "depth";
  beforeCm: Dimensions;
  afterCm: Dimensions;
  targetCm: Dimensions;
  diffs: DimensionDiffs;
  valid: boolean;
  warnings: string[];
}

function computeSceneBoundingBox(doc: Document): { min: [number, number, number]; max: [number, number, number] } {
  const root = doc.getRoot();
  const scene = root.getDefaultScene() || root.listScenes()[0];
  if (!scene) {
    throw new Error("No scene found in GLB");
  }

  const min: [number, number, number] = [Infinity, Infinity, Infinity];
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];
  let hasValidMesh = false;

  const traverseNode = (node: any, parentMatrix: mat4) => {
    const t = node.getTranslation() || [0, 0, 0];
    const r = node.getRotation() || [0, 0, 0, 1];
    const s = node.getScale() || [1, 1, 1];

    const localMatrix = mat4.create();
    mat4.fromRotationTranslationScale(
      localMatrix,
      r as [number, number, number, number],
      t as [number, number, number],
      s as [number, number, number]
    );

    const explicitMatrix = node.getMatrix();
    if (explicitMatrix) {
      mat4.copy(localMatrix, explicitMatrix as unknown as mat4);
    }

    const worldMatrix = mat4.create();
    mat4.multiply(worldMatrix, parentMatrix, localMatrix);

    const mesh = node.getMesh();
    if (mesh) {
      for (const prim of mesh.listPrimitives()) {
        const pos = prim.getAttribute("POSITION");
        if (!pos) continue;

        const count = pos.getCount();
        const v = vec3.create();
        const tPos = vec3.create();

        for (let i = 0; i < count; i++) {
          pos.getElement(i, v as [number, number, number]);
          vec3.transformMat4(tPos, v, worldMatrix);

          if (tPos[0] < min[0]) min[0] = tPos[0];
          if (tPos[1] < min[1]) min[1] = tPos[1];
          if (tPos[2] < min[2]) min[2] = tPos[2];
          if (tPos[0] > max[0]) max[0] = tPos[0];
          if (tPos[1] > max[1]) max[1] = tPos[1];
          if (tPos[2] > max[2]) max[2] = tPos[2];
          hasValidMesh = true;
        }
      }
    }

    for (const child of node.listChildren()) {
      traverseNode(child, worldMatrix);
    }
  };

  const identity = mat4.create();
  scene.listChildren().forEach((child) => traverseNode(child, identity));

  if (!hasValidMesh) {
    throw new Error("No mesh found in GLB");
  }

  return { min, max };
}

export async function rescaleGLB(
  buffer: Buffer,
  targetCm: { widthCm?: number; heightCm?: number; depthCm?: number },
  tolerance: number = 0.05
): Promise<RescaleResult> {
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const doc = await io.readBinary(new Uint8Array(buffer));

  const root = doc.getRoot();
  const scene = root.getDefaultScene() || root.listScenes()[0];
  if (!scene) {
    throw new Error("No scene found in GLB");
  }

  // 1. Detect and remove existing scaler node to prevent cumulative scaling and restore original state
  const existingScaler = scene.listChildren().find((child) => child.getName() === "AR_Scaler_Root");
  if (existingScaler) {
    console.log("[glb-scaler] Existing AR_Scaler_Root found. Restoring original node hierarchy.");
    const originalChildren = [...existingScaler.listChildren()];
    originalChildren.forEach((child) => {
      existingScaler.removeChild(child);
      scene.addChild(child);
    });
    scene.removeChild(existingScaler);
    existingScaler.dispose();
  }

  // 2. Calculate current (native) bounding box after normalization
  const nativeBBox = computeSceneBoundingBox(doc);
  const nativeWidth = nativeBBox.max[0] - nativeBBox.min[0];
  const nativeHeight = nativeBBox.max[1] - nativeBBox.min[1];
  const nativeDepth = nativeBBox.max[2] - nativeBBox.min[2];

  const beforeCm: Dimensions = {
    width: Math.round(nativeWidth * 100 * 10) / 10,
    depth: Math.round(nativeDepth * 100 * 10) / 10,
    height: Math.round(nativeHeight * 100 * 10) / 10,
  };

  // 3. Compute uniform scaling factor
  let factor = 1.0;
  let sourceDimension: "width" | "height" | "depth" = "width";

  const targetWidthM = targetCm.widthCm ? targetCm.widthCm / 100 : 0;
  const targetHeightM = targetCm.heightCm ? targetCm.heightCm / 100 : 0;
  const targetDepthM = targetCm.depthCm ? targetCm.depthCm / 100 : 0;

  if (targetWidthM > 0 && nativeWidth > 0) {
    factor = targetWidthM / nativeWidth;
    sourceDimension = "width";
  } else if (targetHeightM > 0 && nativeHeight > 0) {
    factor = targetHeightM / nativeHeight;
    sourceDimension = "height";
  } else if (targetDepthM > 0 && nativeDepth > 0) {
    factor = targetDepthM / nativeDepth;
    sourceDimension = "depth";
  } else {
    throw new Error("No target dimensions provided or native dimensions are zero");
  }

  // 4. Centering X/Z = 0, floor-aligning bottom Y = 0
  const centerX = (nativeBBox.min[0] + nativeBBox.max[0]) / 2;
  const centerYMin = nativeBBox.min[1];
  const centerZ = (nativeBBox.min[2] + nativeBBox.max[2]) / 2;

  // Move original scene roots under the new scaler root node
  const originalRoots = [...scene.listChildren()];
  const scalerNode = doc.createNode("AR_Scaler_Root");

  // Apply scale and translation centering on the scaler root node
  scalerNode.setScale([factor, factor, factor]);
  scalerNode.setTranslation([-centerX * factor, -centerYMin * factor, -centerZ * factor]);

  originalRoots.forEach((child) => {
    scene.removeChild(child);
    scalerNode.addChild(child);
  });

  scene.addChild(scalerNode);

  // 5. Calculate new bounding box after scaling to verify correctness
  const scaledBBox = computeSceneBoundingBox(doc);
  const scaledWidth = scaledBBox.max[0] - scaledBBox.min[0];
  const scaledHeight = scaledBBox.max[1] - scaledBBox.min[1];
  const scaledDepth = scaledBBox.max[2] - scaledBBox.min[2];

  const afterCm: Dimensions = {
    width: Math.round(scaledWidth * 100 * 10) / 10,
    depth: Math.round(scaledDepth * 100 * 10) / 10,
    height: Math.round(scaledHeight * 100 * 10) / 10,
  };

  const targetDimensions: Dimensions = {
    width: targetCm.widthCm || 0,
    depth: targetCm.depthCm || 0,
    height: targetCm.heightCm || 0,
  };

  // 6. Compute multi-dimensional diffs and validations
  const diffs: DimensionDiffs = {
    width: targetDimensions.width > 0 ? Math.abs(afterCm.width - targetDimensions.width) / targetDimensions.width : null,
    depth: targetDimensions.depth > 0 ? Math.abs(afterCm.depth - targetDimensions.depth) / targetDimensions.depth : null,
    height: targetDimensions.height > 0 ? Math.abs(afterCm.height - targetDimensions.height) / targetDimensions.height : null,
  };

  const warnings: string[] = [];
  let valid = true;

  // Validate all defined dimensions against tolerance limit
  if (targetDimensions.width > 0 && diffs.width !== null && diffs.width > tolerance) {
    valid = false;
    warnings.push(`Diferencia de ancho (${(diffs.width * 100).toFixed(1)}%) supera tolerancia (${(tolerance * 100).toFixed(0)}%)`);
  }
  if (targetDimensions.height > 0 && diffs.height !== null && diffs.height > tolerance) {
    valid = false;
    warnings.push(`Diferencia de alto (${(diffs.height * 100).toFixed(1)}%) supera tolerancia (${(tolerance * 100).toFixed(0)}%)`);
  }
  if (targetDimensions.depth > 0 && diffs.depth !== null && diffs.depth > tolerance) {
    valid = false;
    warnings.push(`Diferencia de profundidad (${(diffs.depth * 100).toFixed(1)}%) supera tolerancia (${(tolerance * 100).toFixed(0)}%)`);
  }

  // 7. Serialize document to write final GLB buffer
  const outputBuffer = await io.writeBinary(doc);

  return {
    buffer: Buffer.from(outputBuffer),
    scaleFactor: factor,
    sourceDimension,
    beforeCm,
    afterCm,
    targetCm: targetDimensions,
    diffs,
    valid,
    warnings,
  };
}
