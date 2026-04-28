/*
  Warnings:

  - A unique constraint covering the columns `[pin]` on the table `organizer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "planner_event" ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "organizer_pin_key" ON "organizer"("pin");
