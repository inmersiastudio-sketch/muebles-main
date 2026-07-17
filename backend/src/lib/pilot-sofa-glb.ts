import { Document, NodeIO, type Material, type Mesh } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";

function createBoxMesh(document: Document, name: string, material: Material): Mesh {
  const positions = new Float32Array([
    -0.5, 0, 0.5, 0.5, 0, 0.5, 0.5, 1, 0.5, -0.5, 1, 0.5,
    0.5, 0, -0.5, -0.5, 0, -0.5, -0.5, 1, -0.5, 0.5, 1, -0.5,
    -0.5, 0, -0.5, -0.5, 0, 0.5, -0.5, 1, 0.5, -0.5, 1, -0.5,
    0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 1, -0.5, 0.5, 1, 0.5,
    -0.5, 1, 0.5, 0.5, 1, 0.5, 0.5, 1, -0.5, -0.5, 1, -0.5,
    -0.5, 0, -0.5, 0.5, 0, -0.5, 0.5, 0, 0.5, -0.5, 0, 0.5,
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
  // Un GLB admite un único buffer binario; todos los meshes lo comparten.
  const buffer = document.getRoot().listBuffers()[0] || document.createBuffer("sofa-pilot-buffer");
  const primitive = document.createPrimitive()
    .setAttribute("POSITION", document.createAccessor().setType("VEC3").setArray(positions).setBuffer(buffer))
    .setAttribute("NORMAL", document.createAccessor().setType("VEC3").setArray(normals).setBuffer(buffer))
    .setIndices(document.createAccessor().setType("SCALAR").setArray(indices).setBuffer(buffer))
    .setMaterial(material);
  return document.createMesh(name).addPrimitive(primitive);
}

/** Modelo demostrativo determinístico de 2,00 x 0,90 x 0,80 metros. */
export async function generatePilotSofaGLB(): Promise<Buffer> {
  const document = new Document();
  const scene = document.createScene("Sofá piloto");
  const fabric = document.createMaterial("Tapizado bouclé natural")
    .setBaseColorFactor([0.82, 0.76, 0.65, 1])
    .setMetallicFactor(0)
    .setRoughnessFactor(0.82);
  const wood = document.createMaterial("Madera")
    .setBaseColorFactor([0.24, 0.11, 0.05, 1])
    .setMetallicFactor(0)
    .setRoughnessFactor(0.75);
  const fabricBox = createBoxMesh(document, "Volumen tapizado", fabric);
  const woodBox = createBoxMesh(document, "Volumen madera", wood);

  const addBox = (name: string, mesh: Mesh, size: [number, number, number], position: [number, number, number]) => {
    scene.addChild(document.createNode(name).setMesh(mesh).setScale(size).setTranslation(position));
  };

  addBox("Base", fabricBox, [2, 0.22, 0.8], [0, 0.30, 0]);
  addBox("Respaldo", fabricBox, [2, 0.48, 0.16], [0, 0.42, -0.32]);
  addBox("Apoyabrazos izquierdo", fabricBox, [0.16, 0.30, 0.8], [-0.92, 0.42, 0]);
  addBox("Apoyabrazos derecho", fabricBox, [0.16, 0.30, 0.8], [0.92, 0.42, 0]);
  addBox("Almohadón izquierdo", fabricBox, [0.82, 0.12, 0.60], [-0.43, 0.52, 0.06]);
  addBox("Almohadón derecho", fabricBox, [0.82, 0.12, 0.60], [0.43, 0.52, 0.06]);
  for (const [index, x, z] of [[1, -0.82, -0.28], [2, 0.82, -0.28], [3, -0.82, 0.28], [4, 0.82, 0.28]] as const) {
    addBox(`Pata ${index}`, woodBox, [0.08, 0.30, 0.08], [x, 0, z]);
  }

  const binary = await new NodeIO().registerExtensions(ALL_EXTENSIONS).writeBinary(document);
  return Buffer.from(binary);
}
