import express from "express";
import { UserRole } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole, type AuthenticatedRequest } from "../lib/auth.js";

const router = express.Router();

router.use(requireAuth, requireRole([UserRole.SUPER_ADMIN, UserRole.STORE_OWNER]));

const toNumber = (val: unknown) => (val === null || val === undefined ? 0 : Number(val));

router.get("/", async (req, res) => {
  const user = (req as AuthenticatedRequest).user!;
  const storeFilter = user.role === UserRole.STORE_OWNER ? { storeId: user.storeId ?? undefined } : {};

  const now = new Date();
  const last30 = new Date(now);
  last30.setDate(now.getDate() - 30);

  try {
    const [aggAll, ordersCount, agg30, arAll, ar30] = await Promise.all([
      prisma.order.aggregate({ where: storeFilter, _sum: { total: true } }),
      prisma.order.count({ where: storeFilter }),
      prisma.order.aggregate({ where: { ...storeFilter, createdAt: { gte: last30 } }, _sum: { total: true } }),
      prisma.productView.count({ where: { product: storeFilter } }),
      prisma.productView.count({ where: { product: storeFilter, createdAt: { gte: last30 } } }),
    ]);

    const totalSales = toNumber(aggAll._sum.total);
    const totalOrders = ordersCount;
    const avgOrder = totalOrders > 0 ? totalSales / totalOrders : 0;
    const last30Sales = toNumber(agg30._sum.total);

    const storeOrders = await prisma.order.findMany({ where: storeFilter, select: { id: true } });
    const orderIds = storeOrders.map((o) => o.id);

    const topItems = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
      where: storeFilter.storeId ? { orderId: { in: orderIds } } : undefined,
    });

    const topAr = await prisma.productView.groupBy({
      by: ["productId"],
      _count: { productId: true },
      orderBy: { _count: { productId: "desc" } },
      take: 5,
      // where: storeFilter.storeId ? { storeId: storeFilter.storeId } : undefined, // ProductView has no storeId, need to filter later or ignore
    });

    const productIds = Array.from(new Set([...topItems.map((i) => i.productId), ...topAr.map((a) => a.productId)]));
    const products = productIds.length
      ? await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: { store: true },
      })
      : [];

    const topProducts = topItems.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        productId: item.productId,
        name: product?.name ?? "Producto",
        storeName: product?.store?.name ?? "",
        totalSold: toNumber(item._sum?.totalPrice),
        units: toNumber(item._sum?.quantity),
      };
    });

    const topArProducts = topAr.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return {
        productId: item.productId,
        name: product?.name ?? "Producto",
        storeName: product?.store?.name ?? "",
        views: toNumber(item._count?.productId),
      };
    });

    const lowStock = await prisma.product.findMany({
      where: {
        ...(storeFilter.storeId ? { storeId: storeFilter.storeId } : {}),
        inventory: { availableStock: { lte: 3 } },
      },
      orderBy: { inventory: { availableStock: "asc" } },
      take: 5,
      include: { store: true, inventory: true },
    });

    res.json({
      totalSales,
      totalOrders,
      avgOrder,
      last30Sales,
      topProducts,
      arTotal: arAll,
      arLast30: ar30,
      topArProducts,
      lowStock: lowStock.map((p) => ({
        productId: p.id,
        name: p.name,
        stockQty: p.inventory?.availableStock ?? 0,
        storeName: p.store?.name ?? "",
      })),
    });
  } catch (err) {
    console.error("stats error", err);
    res.status(500).json({ error: "Error fetching stats" });
  }
});

// Backward-compatible alias noted by QA (/api/admin/summary)
router.get("/summary", requireRole([UserRole.SUPER_ADMIN, UserRole.STORE_OWNER]), async (_req, res) => {
  res.redirect(307, "/api/admin/stats");
});

export default router;
