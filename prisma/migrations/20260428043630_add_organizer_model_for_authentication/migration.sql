/*
  Warnings:

  - Added the required column `organizerId` to the `planner_event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "planner_event" ADD COLUMN     "organizerId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "organizer" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "weddingTitle" TEXT NOT NULL,
    "pin" TEXT NOT NULL,

    CONSTRAINT "organizer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "planner_event" ADD CONSTRAINT "planner_event_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "organizer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
