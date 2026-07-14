import { Router } from "express";
import { z } from "zod";
import { UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AuthenticatedRequest, requireAuth, requireRole } from "../lib/auth.js";

const router = Router();
router.use(requireAuth, requireRole([UserRole.SUPER_ADMIN]));

const DEFAULT_SETTINGS = {
  tolerance: "0.1",
  storeSlug: "",
  storeWhatsapp: "",
} as const;

type SettingKey = keyof typeof DEFAULT_SETTINGS;

router.get("/", async (req, res) => {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: { key: { in: Object.keys(DEFAULT_SETTINGS) } },
      select: { key: true, value: true },
    });
    const result: Record<SettingKey, string> = { ...DEFAULT_SETTINGS };
    for (const setting of settings) {
      if (setting.key in result) {
        result[setting.key as SettingKey] = setting.value;
      }
    }
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
    const setting = await prisma.systemSetting.upsert({
      where: { key },
      create: { key, value, updatedById: (req as AuthenticatedRequest).user?.id },
      update: { value, updatedById: (req as AuthenticatedRequest).user?.id },
      select: { key: true, value: true, updatedAt: true },
    });
    return res.json(setting);
  } catch (err) {
    return res.status(500).json({ error: "cannot save setting", detail: (err as Error).message });
  }
});

export default router;
