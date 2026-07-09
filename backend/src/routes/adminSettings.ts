import { Router } from "express";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AuthenticatedRequest, requireAuth, requireRole } from "../lib/auth.js";

const router = Router();
router.use(requireAuth, requireRole([UserRole.SUPER_ADMIN]));

// simple key/value store

router.get("/", async (req, res) => {
  try {
    const result: Record<string, string> = {};
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "cannot fetch settings", detail: (err as Error).message });
  }
});

const updateSchema = z.object({
  key: z.enum(["tolerance", "storeSlug", "storeWhatsapp"]),
  value: z.string(),
}).superRefine((data, ctx) => {
  if (data.key === "tolerance") {
    const val = Number(data.value);
    if (isNaN(val) || val < 0 || val > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "tolerance must be a number between 0 and 1",
      });
    }
  }
  if (data.key === "storeSlug") {
    // Slug should only contain lowercase letters, numbers, and hyphens
    if (!/^[a-z0-9-]*$/.test(data.value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "storeSlug must only contain lowercase letters, numbers, and hyphens",
      });
    }
    if (data.value.length > 50) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "storeSlug must be 50 characters or less",
      });
    }
  }
  if (data.key === "storeWhatsapp") {
    // WhatsApp should be numeric (with country code)
    if (!/^\d*$/.test(data.value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "storeWhatsapp must only contain numbers",
      });
    }
  }
});

router.post("/", async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid payload", details: parsed.error.flatten() });
  }
  try {
    const { key, value } = parsed.data;
    const up = { key, value };
    return res.json(up);
  } catch (err) {
    return res.status(500).json({ error: "cannot save setting", detail: (err as Error).message });
  }
});

export default router;
