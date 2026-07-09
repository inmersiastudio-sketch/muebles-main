-- CreateTable
CREATE TABLE "product_logs" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "userId" INTEGER,
    "action" TEXT NOT NULL,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_logs_productId_createdAt_idx" ON "product_logs"("productId", "createdAt");

-- AddForeignKey
ALTER TABLE "product_logs" ADD CONSTRAINT "product_logs_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_logs" ADD CONSTRAINT "product_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
