/*
  Warnings:

  - A unique constraint covering the columns `[payment_id]` on the table `restaurants` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "restaurants" ADD COLUMN     "payment_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "restaurants_payment_id_key" ON "restaurants"("payment_id");
