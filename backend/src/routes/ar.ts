import { Router } from "express";
import { z } from "zod";
import { validateGlbScale } from "../lib/scaleValidator.js";
import { requireAuth, requireRole } from "../lib/auth.js";
import { UserRole } from "@prisma/client";

const router = Router();

const bodySchema = z
  .object({
    file: z.string().min(1),
    widthCm: z.number().optional(),
    depthCm: z.number().optional(),
    heightCm: z.number().optional(),
    tolerance: z.number().optional().default(0.05),
  })
  .refine((data) => data.widthCm || data.depthCm || data.heightCm, {
    message: "Se requiere al menos una dimensión (widthCm/depthCm/heightCm)",
  });

type Suggestion = {
  dimension: "width" | "depth" | "height";
  factor: number;
  projectedSizeCm: { width: number; depth: number; height: number };
  projectedDiffs: { width: number | null; depth: number | null; height: number | null };
};

function computeSuggestion(
  sizeCm: { width: number; depth: number; height: number },
  expected: { width?: number; depth?: number; height?: number },
): Suggestion | null {
  const priority: Array<"width" | "depth" | "height"> = ["width", "depth", "height"];
  const picked = priority.find((key) => expected[key] !== undefined);
  if (!picked) return null;
  const actual = sizeCm[picked];
  const target = expected[picked]!;
  if (!actual || actual === 0) return null;
  const factor = target / actual;
  const projectedSizeCm = {
    width: Math.round(sizeCm.width * factor * 10) / 10,
    depth: Math.round(sizeCm.depth * factor * 10) / 10,
    height: Math.round(sizeCm.height * factor * 10) / 10,
  };
  const projectedDiffs = {
    width: expected.width ? Math.abs(projectedSizeCm.width - expected.width) / expected.width : null,
    depth: expected.depth ? Math.abs(projectedSizeCm.depth - expected.depth) / expected.depth : null,
    height: expected.height ? Math.abs(projectedSizeCm.height - expected.height) / expected.height : null,
  };
  return { dimension: picked, factor, projectedSizeCm, projectedDiffs };
}

router.post("/validate-scale", requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.STORE_OWNER]), async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Payload inválido", details: parsed.error.flatten() });
  }

  const { file, widthCm, depthCm, heightCm, tolerance } = parsed.data;

  try {
    const result = await validateGlbScale({ file, width: widthCm, depth: depthCm, height: heightCm, tolerance });
    const suggestion = computeSuggestion(result.sizeCm, result.expected);
    return res.json({
      ok: result.ok,
      sizeCm: result.sizeCm,
      expected: result.expected,
      diffs: result.diffs,
      tolerance: result.tolerance,
      suggestion,
    });
  } catch (err) {
    console.error("Scale validation error:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return res.status(500).json({ error: "No se pudo validar el modelo", detail: errorMessage });
  }
});

export default router;