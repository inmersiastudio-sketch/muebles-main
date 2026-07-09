import { Document, Node } from "@gltf-transform/core";
import { mat4, vec3 } from "gl-matrix";

export interface GLBValidationResult {
  valid: boolean;
  boundingBox?: {
    width: number;
    height: number;
    depth: number;
  };
  errors?: string[];
  warnings?: string[];
}

/**
 * Validate GLB bounding box dimensions
 * Expected: furniture in meters (e.g., sofa ~2m wide)
 */
export async function validateGLBScale(buffer: Buffer): Promise<GLBValidationResult> {
  try {
    const { NodeIO } = await import("@gltf-transform/core");
    const { ALL_EXTENSIONS } = await import("@gltf-transform/extensions");
    
    // Use NodeIO for backend buffer processing
    const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
    const doc: Document = await io.readBinary(new Uint8Array(buffer));

    const root = doc.getRoot();
    const scene = root.getDefaultScene() || root.listScenes()[0];

    if (!scene) {
      return {
        valid: false,
        errors: ["No scene found in GLB"],
      };
    }

    // Reuse robust traversal logic (similar to scaleValidator)
    let min = [Infinity, Infinity, Infinity];
    let max = [-Infinity, -Infinity, -Infinity];
    let hasValidMesh = false;

    const traverseNode = (node: Node, parentMatrix: mat4) => {
      // 1. Calculate local matrix
      const t = node.getTranslation();
      const r = node.getRotation();
      const s = node.getScale();
      
      const localMatrix = mat4.create();
      mat4.fromRotationTranslationScale(localMatrix, r as [number,number,number,number], t as [number,number,number], s as [number,number,number]);
      
      const explicitMatrix = node.getMatrix();
      if (explicitMatrix) {
        mat4.copy(localMatrix, explicitMatrix as unknown as mat4);
      }

      // 2. World matrix
      const worldMatrix = mat4.create();
      mat4.multiply(worldMatrix, parentMatrix, localMatrix);

      // 3. Process mesh
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

      // 4. Recurse
      for (const child of node.listChildren()) {
        traverseNode(child, worldMatrix);
      }
    };

    const identity = mat4.create();
    scene.listChildren().forEach((child) => traverseNode(child, identity));

    if (!hasValidMesh) {
       return { valid: false, errors: ["No mesh found in scene hierarchy"] };
    }

    const width = max[0] - min[0];
    const height = max[1] - min[1];
    const depth = max[2] - min[2];
    
    // ... rest of validation ...

    const errors: string[] = [];
    const warnings: string[] = [];

    // Reasonable furniture dimensions: 0.1m (10cm) to 10m
    const MIN = 0.1;
    const MAX = 10;

    if (width < MIN || width > MAX) {
      warnings.push(`Width ${width.toFixed(2)}m is unusual (expected ${MIN}-${MAX}m)`);
    }
    if (height < MIN || height > MAX) {
      warnings.push(`Height ${height.toFixed(2)}m is unusual (expected ${MIN}-${MAX}m)`);
    }
    if (depth < MIN || depth > MAX) {
      warnings.push(`Depth ${depth.toFixed(2)}m is unusual (expected ${MIN}-${MAX}m)`);
    }

    // Too small (likely millimeters instead of meters)
    if (width < 0.05 || height < 0.05 || depth < 0.05) {
      errors.push("Model appears too small. Check if units are in millimeters instead of meters.");
    }

    // Too large
    if (width > 20 || height > 20 || depth > 20) {
      errors.push("Model appears too large. Consider scaling down.");
    }

    return {
      valid: errors.length === 0,
      boundingBox: { width, height, depth },
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : "Unknown validation error"],
    };
  }
}
