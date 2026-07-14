import { InquiryResult, InquiryStatus, type Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

const OPEN_STATUSES = [
  InquiryStatus.NEW,
  InquiryStatus.VIEWED,
  InquiryStatus.CONTACTED,
];

const LOSS_RESULTS = [
  InquiryResult.LOST_PRICE,
  InquiryResult.LOST_STOCK,
  InquiryResult.LOST_NO_REPLY,
  InquiryResult.LOST_OTHER,
];

export type InquiryOperationalStats = {
  total: number;
  open: number;
  closed: number;
  overdueOpen: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  byStatus: Record<InquiryStatus, number>;
  byResult: Record<InquiryResult, number>;
  sales: {
    count: number;
    totalAmount: number;
  };
  conversionRate: number;
  inquiryToSaleRate: number;
  closeRate: number;
  totalInquiries: number;
  pendingInquiries: number;
  convertedInquiries: number;
  lostInquiries: number;
  totalRevenue: number;
};

function atStartOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export async function getInquiryOperationalStats(
  scope: Prisma.ProductInquiryWhereInput,
): Promise<InquiryOperationalStats> {
  const now = new Date();
  const today = atStartOfDay(now);
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  const monthAgo = new Date(now);
  monthAgo.setDate(now.getDate() - 30);
  const overdueThreshold = new Date(now);
  overdueThreshold.setHours(now.getHours() - 24);

  const [
    total,
    byStatusRows,
    byResultRows,
    todayCount,
    weekCount,
    monthCount,
    overdueOpen,
    sales,
  ] = await Promise.all([
    prisma.productInquiry.count({ where: scope }),
    prisma.productInquiry.groupBy({
      by: ['status'],
      where: scope,
      _count: { id: true },
    }),
    prisma.productInquiry.groupBy({
      by: ['result'],
      where: { ...scope, result: { not: null } },
      _count: { id: true },
    }),
    prisma.productInquiry.count({
      where: { ...scope, createdAt: { gte: today } },
    }),
    prisma.productInquiry.count({
      where: { ...scope, createdAt: { gte: weekAgo } },
    }),
    prisma.productInquiry.count({
      where: { ...scope, createdAt: { gte: monthAgo } },
    }),
    prisma.productInquiry.count({
      where: {
        ...scope,
        status: { in: OPEN_STATUSES },
        createdAt: { lt: overdueThreshold },
      },
    }),
    prisma.productInquiry.aggregate({
      where: { ...scope, result: InquiryResult.SOLD },
      _sum: { finalAmount: true },
      _count: { id: true },
    }),
  ]);

  const byStatus = Object.values(InquiryStatus).reduce((counts, status) => {
    counts[status] = byStatusRows.find((row) => row.status === status)?._count.id ?? 0;
    return counts;
  }, {} as Record<InquiryStatus, number>);

  const byResult = Object.values(InquiryResult).reduce((counts, result) => {
    counts[result] = byResultRows.find((row) => row.result === result)?._count.id ?? 0;
    return counts;
  }, {} as Record<InquiryResult, number>);

  const open = OPEN_STATUSES.reduce((count, status) => count + byStatus[status], 0);
  const closed = byStatus[InquiryStatus.CLOSED];
  const sold = byResult[InquiryResult.SOLD];
  const lost = LOSS_RESULTS.reduce((count, result) => count + byResult[result], 0);
  const totalRevenue = sales._sum.finalAmount ?? 0;

  return {
    total,
    open,
    closed,
    overdueOpen,
    today: todayCount,
    thisWeek: weekCount,
    thisMonth: monthCount,
    byStatus,
    byResult,
    sales: {
      count: sales._count.id,
      totalAmount: totalRevenue,
    },
    // Kept as the close-to-sale rate used by the existing analytics screen.
    conversionRate: closed > 0 ? sold / closed : 0,
    inquiryToSaleRate: total > 0 ? sold / total : 0,
    closeRate: total > 0 ? closed / total : 0,
    // Compatibility fields for the existing operations dashboard.
    totalInquiries: total,
    pendingInquiries: open,
    convertedInquiries: sold,
    lostInquiries: lost,
    totalRevenue,
  };
}
