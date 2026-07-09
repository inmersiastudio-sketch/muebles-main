import { NodeIO, type Document, type Node } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import fs from "node:fs";
import path from "node:path";
import { mat4, vec3 } from "gl-matrix";

// Helper for matrix multiplication if necessary, or simple transform logic
// But we'll implement a robust traversal.

export type ScaleValidationInput = {
// ... existing types

  file: string; // ruta local o URL https
  width?: number; // cm
  depth?: number; // cm
  height?: number; // cm
  tolerance?: number; // fracción, ej 0.05 = 5%
};

export type ScaleValidationResult = {
  sizeCm: { width: number; depth: number; height: number };
  expected: { width?: number; depth?: number; height?: number };
  tolerance: number;
  diffs: { width: number | null; depth: number | null; height: number | null };
  ok: boolean;
};

async function loadBuffer(file: string): Promise<Buffer> {
  if (file.startsWith("http://") || file.startsWith("https://")) {
    // For Cloudinary raw files, sometimes the URL doesn't include .glb extension
    // Try the URL as-is first, then with .glb appended if it fails
    let url = file;
    console.log(`[scaleValidator] Attempting to download: ${url}`);
    let res = await fetch(url);
    
    // If first attempt fails and URL doesn't end with .glb, try appending .glb
    if (!res.ok && !url.toLowerCase().includes('.glb')) {
      url = file + '.glb';
      console.log(`[scaleValidator] First attempt failed, trying with .glb: ${url}`);
      res = await fetch(url);
    }
    
    if (!res.ok) {
      throw new Error(`No se pudo descargar ${file}: ${res.status} ${res.statusText}`);
    }
    
    console.log(`[scaleValidator] Successfully downloaded GLB from ${url}`);
    const arr = new Uint8Array(await res.arrayBuffer());
    return Buffer.from(arr);
  }
  const resolved = path.resolve(process.cwd(), file);
  return fs.promises.readFile(resolved);
}

function computeBBox(doc: Document) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  let hasValidMesh = false;

  const traverseNode = (node: Node, parentMatrix: mat4) => {
    // Calculate local matrix from TRS (Translation, Rotation, Scale)
    // Note: gltf-transform nodes use TRS by default. 
    // .getMatrix() returns the matrix property if explicitly set.
    const t = node.getTranslation();
    const r = node.getRotation();
    const s = node.getScale();
    
    // Create local matrix from TRS
    const localMatrix = mat4.create();
    mat4.fromRotationTranslationScale(
      localMatrix, 
      r as [number, number, number, number], 
      t as [number, number, number], 
      s as [number, number, number]
    );

    // If explicit matrix exists, it overrides TRS? 
    // In glTF spec, either matrix or TRS is present. gltf-transform handles this via getters.
    // If matrix is set on the node, getMatrix() returns it.
    const explicitMatrix = node.getMatrix();
    if (explicitMatrix) {
      mat4.copy(localMatrix, explicitMatrix as unknown as mat4);
    }

    // World matrix = Parent * Local
    const worldMatrix = mat4.create();
    mat4.multiply(worldMatrix, parentMatrix, localMatrix);

    const mesh = node.getMesh();
    if (mesh) {
      for (const prim of mesh.listPrimitives()) {
        const posAccessor = prim.getAttribute("POSITION");
        if (!posAccessor) continue;

        const count = posAccessor.getCount();
        const v = vec3.create();
        const t = vec3.create();

        for (let i = 0; i < count; i++) {
          // getElement returns the semantic value (applying quantization/normalization)
          posAccessor.getElement(i, v as [number, number, number]);

          // Transform vertex to world space
          vec3.transformMat4(t, v, worldMatrix);

          // Update bounds
          if (t[0] < min[0]) min[0] = t[0];
          if (t[1] < min[1]) min[1] = t[1];
          if (t[2] < min[2]) min[2] = t[2];
          if (t[0] > max[0]) max[0] = t[0];
          if (t[1] > max[1]) max[1] = t[1];
          if (t[2] > max[2]) max[2] = t[2];
          hasValidMesh = true;
        }
      }
    }

    // Recurse to children
    for (const child of node.listChildren()) {
      traverseNode(child, worldMatrix);
    }
  };

  const identity = mat4.create();
  
  // Start traversal from Scene root nodes
  const root = doc.getRoot();
  const scenes = root.listScenes();

  if (scenes.length > 0) {
    // Process default scene (or all scenes)
    // Usually only the default scene matters for the model's dimensions
    const scene = root.getDefaultScene() || scenes[0];
    scene.listChildren().forEach((child) => {
      traverseNode(child, identity);
    });
  } else {
    // Fallback: iterate over all nodes that have no parent (roots)
    root.listNodes().forEach((node) => {
      // In glTF-Transform v4, use listParents() to check for parent nodes
      if (node.listParents().length === 0) {
        traverseNode(node, identity);
      }
    });
  }
  
  if (!hasValidMesh) return { min: [0, 0, 0], max: [0, 0, 0] };
  if (min[0] === Infinity) return { min: [0, 0, 0], max: [0, 0, 0] };

  return { min, max };
}

const formatCm = (meters: number) => Math.round(meters * 1000) / 10;
const percentDiff = (expected: number, actual: number) => (expected ? Math.abs(actual - expected) / expected : null);

export async function validateGlbScale(input: ScaleValidationInput): Promise<ScaleValidationResult> {
  const { file, width, depth, height, tolerance = 0.05 } = input;
  if (!file) throw new Error("Falta file");
  if (!width && !depth && !height) throw new Error("Falta al menos una dimensión esperada");

  // Register all extensions including KHR_mesh_quantization
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const buffer = await loadBuffer(file);
  const doc = await io.readBinary(buffer);
  const { min, max } = computeBBox(doc);
  const sizeMeters = {
    width: max[0] - min[0],
    height: max[1] - min[1],
    depth: max[2] - min[2],
  };
  const sizeCm = {
    width: formatCm(sizeMeters.width),
    height: formatCm(sizeMeters.height),
    depth: formatCm(sizeMeters.depth),
  };

  const diffs = {
    width: width ? percentDiff(width, sizeCm.width) : null,
    depth: depth ? percentDiff(depth, sizeCm.depth) : null,
    height: height ? percentDiff(height, sizeCm.height) : null,
  };

  let ok = true;
  for (const key of ["width", "depth", "height"] as const) {
    const diff = diffs[key];
    if (diff !== null && diff > tolerance) ok = false;
  }

  return { sizeCm, expected: { width, depth, height }, tolerance, diffs, ok };
}
