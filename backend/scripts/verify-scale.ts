import { Document, NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { rescaleGLB } from "../src/lib/glb-scaler.js";

async function createTestGLB(offset: [number, number, number] = [0, 0, 0]): Promise<Buffer> {
  const doc = new Document();
  const scene = doc.createScene("default");
  const node = doc.createNode("mesh-node");
  const mesh = doc.createMesh("test-mesh");
  const prim = doc.createPrimitive();

  // Create a 3D box of size 0.5 x 0.4 x 0.3 meters
  // Min coordinates: offset
  // Max coordinates: [offset[0] + 0.5, offset[1] + 0.4, offset[2] + 0.3]
  const ox = offset[0];
  const oy = offset[1];
  const oz = offset[2];

  const positions = new Float32Array([
    ox, oy, oz,
    ox + 0.5, oy, oz,
    ox, oy + 0.4, oz,
    ox, oy, oz + 0.3,
    ox + 0.5, oy + 0.4, oz + 0.3
  ]);

  const buffer = doc.createBuffer("test-buffer");
  const posAccessor = doc.createAccessor()
    .setType("VEC3")
    .setArray(positions)
    .setBuffer(buffer);
  prim.setAttribute("POSITION", posAccessor);
  mesh.addPrimitive(prim);
  node.setMesh(mesh);
  scene.addChild(node);

  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
  const binary = await io.writeBinary(doc);
  return Buffer.from(binary);
}

async function readTestDocument(buffer: Buffer) {
  return new NodeIO().registerExtensions(ALL_EXTENSIONS).readBinary(buffer);
}

async function expectFailure(buffer: Buffer, message: string) {
  try {
    await rescaleGLB(buffer, { widthCm: 100 });
    throw new Error(`Expected failure: ${message}`);
  } catch (error) {
    if ((error as Error).message === `Expected failure: ${message}`) throw error;
  }
}

async function runTests() {
  console.log("=== STARTING GLB SCALER VERIFICATION TESTS ===");

  // Test 1: Programmatic mock GLB scaling
  console.log("\nTest 1: Scaling a mock GLB with offset...");
  const originalBuffer = await createTestGLB([10.0, 5.0, -2.0]); // Offset away from origin

  // Target: widthCm = 200cm (2.0 meters) -> Scale factor should be 2.0 / 0.5 = 4.0
  const result = await rescaleGLB(originalBuffer, { widthCm: 200, heightCm: 160, depthCm: 120 });
  
  console.log("Scale Factor computed:", result.scaleFactor);
  console.log("Before dimensions (cm):", result.beforeCm);
  console.log("After dimensions (cm):", result.afterCm);
  console.log("Target dimensions (cm):", result.targetCm);
  console.log("Dimension Diffs:", result.diffs);
  console.log("Is Valid scale check:", result.valid);

  if (result.scaleFactor !== 4.0) {
    throw new Error(`Expected scale factor 4.0, got ${result.scaleFactor}`);
  }
  if (result.afterCm.width !== 200.0) {
    throw new Error(`Expected after scale width to be 200, got ${result.afterCm.width}`);
  }
  if (result.afterCm.height !== 160.0) {
    throw new Error(`Expected after scale height to be 160, got ${result.afterCm.height}`);
  }
  if (result.afterCm.depth !== 120.0) {
    throw new Error(`Expected after scale depth to be 120, got ${result.afterCm.depth}`);
  }
  if (!result.valid) {
    throw new Error(`Expected rescale result to be valid, got warnings: ${result.warnings.join(", ")}`);
  }
  console.log("✅ Test 1 Passed!");

  // Test 2: Idempotency (rescaling a previously scaled GLB)
  console.log("\nTest 2: Rescaling a previously scaled GLB (Idempotency test)...");
  // Target: scale it down to 100cm (1.0 meter) -> Scale factor from native (0.5m) should be 2.0
  const result2 = await rescaleGLB(result.buffer, { widthCm: 100, heightCm: 80, depthCm: 60 });
  
  console.log("Scale Factor computed:", result2.scaleFactor);
  console.log("Before dimensions (cm) [should show native size 50x30x40]:", result2.beforeCm);
  console.log("After dimensions (cm):", result2.afterCm);
  
  if (result2.scaleFactor !== 2.0) {
    throw new Error(`Expected scale factor 2.0, got ${result2.scaleFactor}`);
  }
  if (result2.afterCm.width !== 100.0) {
    throw new Error(`Expected after scale width to be 100, got ${result2.afterCm.width}`);
  }
  const idempotentDoc = await readTestDocument(result2.buffer);
  const idempotentRoot = idempotentDoc.getRoot();
  const idempotentScene = idempotentRoot.getDefaultScene() || idempotentRoot.listScenes()[0];
  const scalerRoots = idempotentScene?.listChildren()
    .filter((node) => node.getName() === "AR_Scaler_Root") ?? [];
  if (scalerRoots.length !== 1) {
    throw new Error(`Expected exactly one AR_Scaler_Root, got ${scalerRoots.length}`);
  }
  console.log("✅ Test 2 Passed (No cumulative roots created, original coordinates restored correctly)!");

  // Test 3: Validation and Diffs warning threshold
  console.log("\nTest 3: Testing tolerances and warning threshold...");
  // Target: width matches perfectly, but height doesn't (deformed). 
  // Let's pass a target height that is too far off to trigger a validation warning.
  const result3 = await rescaleGLB(originalBuffer, { widthCm: 200, heightCm: 50 }); // Target height 50cm is far off from projected 160cm!
  
  console.log("Is Valid check (should be false due to height mismatch):", result3.valid);
  console.log("Warnings list:", result3.warnings);

  if (result3.valid) {
    throw new Error("Expected validation to fail due to height difference");
  }
  if (result3.warnings.length === 0) {
    throw new Error("Expected warning message for height tolerance exceedance");
  }
  console.log("✅ Test 3 Passed!");

  // Test 4: Existing rotation in the original hierarchy.
  console.log("\nTest 4: Preserving a pre-rotated model hierarchy...");
  const rotatedDoc = await readTestDocument(await createTestGLB());
  const rotatedRoot = rotatedDoc.getRoot();
  const rotatedScene = rotatedRoot.getDefaultScene() || rotatedRoot.listScenes()[0];
  const rotatedNode = rotatedScene?.listChildren()[0];
  if (!rotatedNode) throw new Error("Expected a root node in rotated fixture");
  rotatedNode.setRotation([0, Math.sin(Math.PI / 4), 0, Math.cos(Math.PI / 4)]);
  const rotatedBinary = await new NodeIO().registerExtensions(ALL_EXTENSIONS).writeBinary(rotatedDoc);
  const rotatedResult = await rescaleGLB(Buffer.from(rotatedBinary), { widthCm: 120 });
  if (rotatedResult.afterCm.width !== 120) {
    throw new Error(`Expected rotated width 120, got ${rotatedResult.afterCm.width}`);
  }
  console.log("✅ Test 4 Passed!");

  // Test 5: Invalid documents fail explicitly.
  console.log("\nTest 5: Rejecting documents without scene or POSITION data...");
  const noSceneBinary = await new NodeIO().writeBinary(new Document());
  await expectFailure(Buffer.from(noSceneBinary), "document without scene");

  const noPositionDoc = new Document();
  const emptyScene = noPositionDoc.createScene("empty");
  emptyScene.addChild(noPositionDoc.createNode("empty-node"));
  const noPositionBinary = await new NodeIO().writeBinary(noPositionDoc);
  await expectFailure(Buffer.from(noPositionBinary), "document without POSITION");
  console.log("✅ Test 5 Passed!");

  console.log("\n=== ALL VERIFICATION TESTS COMPLETED SUCCESSFULLY ===");
}

runTests().catch((e) => {
  console.error("❌ Test run failed:", e);
  process.exit(1);
});
