import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, AuthenticatedRequest } from "../lib/auth.js";
import { UserRole } from "@prisma/client";

const router = Router();

// All routes require authentication
router.use(requireAuth);

// GET /api/admin/orders — list orders for the authenticated user's store (or all if ADMIN)
router.get("/", async (req, res) => {
    const user = (req as AuthenticatedRequest).user!;
    try {
        const where: any = {};
        if (user.role === UserRole.STORE_OWNER && user.storeId) {
            where.storeId = user.storeId;
        }

        // Optional filters
        const { status, from, to } = req.query;
        if (status && typeof status === "string") {
            where.status = status;
        }
        if (from && typeof from === "string") {
            const fromDate = new Date(from);
            if (isNaN(fromDate.getTime())) return res.status(400).json({ error: "Invalid 'from' date" });
            where.createdAt = { ...where.createdAt, gte: fromDate };
        }
        if (to && typeof to === "string") {
            const toDate = new Date(to);
            if (isNaN(toDate.getTime())) return res.status(400).json({ error: "Invalid 'to' date" });
            where.createdAt = { ...where.createdAt, lte: toDate };
        }

        const orders = await prisma.order.findMany({
            where,
            include: {
                items: {
                    include: {
                        product: { select: { name: true, slug: true, media: { select: { url: true }, take: 1 } } },
                    },
                },
                store: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 200,
        });

        return res.json(orders);
    } catch (err) {
        console.error("Error loading orders", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// GET /api/admin/orders/:id — single order detail
router.get("/:id", async (req, res) => {
    const user = (req as AuthenticatedRequest).user!;
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: "Invalid order ID" });

    try {
        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: { select: { name: true, slug: true, media: { select: { url: true }, take: 1 } } },
                    },
                },
                store: { select: { name: true } },
            },
        });

        if (!order) return res.status(404).json({ error: "Order not found" });

        // Enforce store isolation
        if (user.role === UserRole.STORE_OWNER && user.storeId && order.storeId !== user.storeId) {
            return res.status(403).json({ error: "Forbidden" });
        }

        return res.json(order);
    } catch (err) {
        console.error("Error loading order", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

// PUT /api/admin/orders/:id — update order status / notes
const updateSchema = z.object({
    status: z.enum(["PENDING", "CONFIRMED", "PAID", "SHIPPED", "DELIVERED", "CANCELED"]).optional(),
    notes: z.string().optional(),
    customer: z.string().optional(),
    customerPhone: z.string().optional(),
    customerEmail: z.string().optional(),
});

router.put("/:id", async (req, res) => {
    const user = (req as AuthenticatedRequest).user!;
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: "Invalid order ID" });

    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });

    try {
        // Check ownership
        const existing = await prisma.order.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ error: "Order not found" });
        if (user.role === UserRole.STORE_OWNER && user.storeId && existing.storeId !== user.storeId) {
            return res.status(403).json({ error: "Forbidden" });
        }

        const updated = await prisma.order.update({
            where: { id },
            data: parsed.data as any,
            include: {
                items: {
                    include: {
                        product: { select: { name: true, slug: true, media: { select: { url: true }, take: 1 } } },
                    },
                },
                store: { select: { name: true } },
            },
        });

        return res.json(updated);
    } catch (err) {
        console.error("Error updating order", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
