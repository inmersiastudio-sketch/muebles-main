import process from "process";
import { validateGlbScale } from "../src/lib/scaleValidator.js";

/**
 * CLI: valida que el bounding box del GLB coincida con dimensiones declaradas.
 * Uso:
 *   pnpm tsx scripts/validate-glb-scale.ts --file model.glb --width 80 --depth 60 --height 45 --tolerance 0.05
 * - file: ruta local o URL (https)
 * - width/depth/height: en cm (obligatorio al menos uno)
 * - tolerance: fracción (0.05 = 5%)
 * Salida: muestra dimensiones del GLB en cm y diferencia porcentual. Código de salida 1 si excede tolerancia.
 */

function parseArgs() {
  const args = process.argv.slice(2);
  const out: Record<string, string> = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace(/^--/, "");
    const val = args[i + 1];
    if (key) out[key] = val;
  }
  return out;
}

async function main() {
  const { file, width, depth, height, tolerance = "0.05" } = parseArgs();
  if (!file) {
    console.error("Falta --file <ruta|url>");
    process.exit(1);
  }
  const expected = {
    width: width ? Number(width) : undefined,
    depth: depth ? Number(depth) : undefined,
    height: height ? Number(height) : undefined,
  };
  if (!expected.width && !expected.depth && !expected.height) {
    console.error("Falta al menos una dimensión declarada (--width/--depth/--height) en cm");
    process.exit(1);
  }

  const tol = Number(tolerance);
  const result = await validateGlbScale({ file, width: expected.width, depth: expected.depth, height: expected.height, tolerance: tol });

  console.info("Dimensiones GLB (cm)", result.sizeCm);
  console.info("Dimensiones esperadas (cm)", result.expected);
  console.info("Tolerancia", `${result.tolerance * 100}%`);

  for (const key of ["width", "depth", "height"] as const) {
    const diff = result.diffs[key];
    if (diff !== null && diff > result.tolerance) {
      console.error(`Dif. ${key} excede tolerancia: ${(diff * 100).toFixed(2)}%`);
    }
  }

  if (!result.ok) process.exit(1);
  console.info("OK: bounding box coincide con las dimensiones declaradas dentro de la tolerancia");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
