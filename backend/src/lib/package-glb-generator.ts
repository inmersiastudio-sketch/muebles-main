import { Document, NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";

export type PackageDimensions = {
  widthCm: number;
  heightCm: number;
  depthCm: number;
};

function assertDimension(value: number, label: string): number {
  if (!Number.isFinite(value) || value <= 0 || value > 2_000) {
    throw new Error(`${label} debe ser mayor a 0 y menor o igual a 2000 cm.`);
  }
  return value / 100;
}

/**
 * Genera una caja GLB determinística, centrada en X/Z y apoyada sobre Y=0.
 * La geometría se crea directamente en metros, por lo que no requiere QA de escala.
 */
export async function generatePackageGLB(dimensions: PackageDimensions): Promise<Buffer> {
  const width = assertDimension(dimensions.widthCm, "El ancho");
  const height = assertDimension(dimensions.heightCm, "El alto");
  const depth = assertDimension(dimensions.depthCm, "La profundidad");
  const x = width / 2;
  const z = depth / 2;

  // Cuatro vértices por cara permiten normales planas correctas.
  const positions = new Float32Array([
    -x, 0, z, x, 0, z, x, height, z, -x, height, z,
    x, 0, -z, -x, 0, -z, -x, height, -z, x, height, -z,
    -x, 0, -z, -x, 0, z, -x, height, z, -x, height, -z,
    x, 0, z, x, 0, -z, x, height, -z, x, height, z,
    -x, height, z, x, height, z, x, height, -z, -x, height, -z,
    -x, 0, -z, x, 0, -z, x, 0, z, -x, 0, z,
  ]);
  const normals = new Float32Array([
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
    0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
    -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
    0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
  ]);
  const indices = new Uint16Array([
    0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7,
    8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15,
    16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23,
  ]);

  const document = new Document();
  const buffer = document.createBuffer("package-buffer");
  const positionAccessor = document.createAccessor("positions").setType("VEC3").setArray(positions).setBuffer(buffer);
  const normalAccessor = document.createAccessor("normals").setType("VEC3").setArray(normals).setBuffer(buffer);
  const indexAccessor = document.createAccessor("indices").setType("SCALAR").setArray(indices).setBuffer(buffer);
  const material = document.createMaterial("Cartón")
    .setBaseColorFactor([0.58, 0.36, 0.18, 1])
    .setMetallicFactor(0)
    .setRoughnessFactor(0.92);
  const primitive = document.createPrimitive()
    .setAttribute("POSITION", positionAccessor)
    .setAttribute("NORMAL", normalAccessor)
    .setIndices(indexAccessor)
    .setMaterial(material);
  const mesh = document.createMesh("Caja de embalaje").addPrimitive(primitive);
  const node = document.createNode("Package_Box").setMesh(mesh);
  document.createScene("Embalaje").addChild(node);

  const binary = await new NodeIO().registerExtensions(ALL_EXTENSIONS).writeBinary(document);
  return Buffer.from(binary);
}
