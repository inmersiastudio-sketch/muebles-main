/*
  Warnings:

  - You are about to drop the column `channel` on the `product_inquiries` table. All the data in the column will be lost.
  - You are about to drop the column `contact` on the `product_inquiries` table. All the data in the column will be lost.
  - You are about to drop the column `isResponded` on the `product_inquiries` table. All the data in the column will be lost.
  - You are about to drop the column `respondedAt` on the `product_inquiries` table. All the data in the column will be lost.
  - Added the required column `customerName` to the `product_inquiries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerPhone` to the `product_inquiries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storeId` to the `product_inquiries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `product_inquiries` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'VIEWED', 'CONTACTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "InquiryResult" AS ENUM ('SOLD', 'LOST_PRICE', 'LOST_STOCK', 'LOST_NO_REPLY', 'LOST_OTHER', 'PENDING');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD');

-- CreateEnum
CREATE TYPE "AI3DJobStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "CreditPurchaseStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'FAILED');

-- AlterTable
ALTER TABLE "product_inquiries" DROP COLUMN "channel",
DROP COLUMN "contact",
DROP COLUMN "isResponded",
DROP COLUMN "respondedAt",
ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "customerEmail" TEXT,
ADD COLUMN     "customerName" TEXT NOT NULL,
ADD COLUMN     "customerPhone" TEXT NOT NULL,
ADD COLUMN     "finalAmount" DOUBLE PRECISION,
ADD COLUMN     "result" "InquiryResult",
ADD COLUMN     "resultNote" TEXT,
ADD COLUMN     "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
ADD COLUMN     "storeId" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "variantId" TEXT;

-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "ai3dCredits" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ai3dUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "aiCreditsLimit" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "aiCreditsUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastPaymentDate" TIMESTAMP(3),
ADD COLUMN     "maxProducts" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "mpPreapprovalId" TEXT,
ADD COLUMN     "nextPaymentDate" TIMESTAMP(3),
ADD COLUMN     "paymentStatus" TEXT,
ADD COLUMN     "planType" TEXT,
ADD COLUMN     "socialFacebook" TEXT,
ADD COLUMN     "socialInstagram" TEXT,
ADD COLUMN     "subscriptionTier" "SubscriptionTier" NOT NULL DEFAULT 'BRONZE',
ADD COLUMN     "website" TEXT;

-- DropEnum
DROP TYPE "InquiryChannel";

-- CreateTable
CREATE TABLE "email_verification_tokens" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_3d_jobs" (
    "id" TEXT NOT NULL,
    "storeId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "variantId" TEXT,
    "imageUrl" TEXT NOT NULL,
    "imageUrls" TEXT[],
    "provider" TEXT NOT NULL DEFAULT 'meshy',
    "providerJobId" TEXT,
    "status" "AI3DJobStatus" NOT NULL DEFAULT 'PENDING',
    "creditsUsed" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "glbUrl" TEXT,
    "usdzUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_3d_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credit_purchases" (
    "id" TEXT NOT NULL,
    "storeId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "creditsAwarded" INTEGER NOT NULL,
    "status" "CreditPurchaseStatus" NOT NULL DEFAULT 'PENDING',
    "paymentGateway" TEXT NOT NULL DEFAULT 'MERCADO_PAGO',
    "gatewayRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_logs" (
    "id" SERIAL NOT NULL,
    "storeId" INTEGER NOT NULL,
    "eventType" TEXT NOT NULL,
    "mpPaymentId" TEXT NOT NULL,
    "mpPreapprovalId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_tokens_token_key" ON "email_verification_tokens"("token");

-- CreateIndex
CREATE INDEX "ai_3d_jobs_storeId_idx" ON "ai_3d_jobs"("storeId");

-- CreateIndex
CREATE INDEX "ai_3d_jobs_productId_idx" ON "ai_3d_jobs"("productId");

-- CreateIndex
CREATE INDEX "ai_3d_jobs_variantId_idx" ON "ai_3d_jobs"("variantId");

-- CreateIndex
CREATE INDEX "ai_3d_jobs_status_idx" ON "ai_3d_jobs"("status");

-- CreateIndex
CREATE INDEX "credit_purchases_storeId_idx" ON "credit_purchases"("storeId");

-- CreateIndex
CREATE INDEX "credit_purchases_status_idx" ON "credit_purchases"("status");

-- AddForeignKey
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_inquiries" ADD CONSTRAINT "product_inquiries_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_inquiries" ADD CONSTRAINT "product_inquiries_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_3d_jobs" ADD CONSTRAINT "ai_3d_jobs_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_3d_jobs" ADD CONSTRAINT "ai_3d_jobs_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_3d_jobs" ADD CONSTRAINT "ai_3d_jobs_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_purchases" ADD CONSTRAINT "credit_purchases_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "stores"("id") ON DELETE CASCADE ON UPDATE CASCADE;
