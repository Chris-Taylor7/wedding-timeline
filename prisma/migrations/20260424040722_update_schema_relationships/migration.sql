/*
  Warnings:

  - You are about to drop the `PlannerEvent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "PlannerEvent";

-- CreateTable
CREATE TABLE "planner_event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT 'yellow',

    CONSTRAINT "planner_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendee" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "attendee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_attendee" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "attendeeId" TEXT NOT NULL,

    CONSTRAINT "event_attendee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "attendee_name_key" ON "attendee"("name");

-- CreateIndex
CREATE UNIQUE INDEX "event_attendee_eventId_attendeeId_key" ON "event_attendee"("eventId", "attendeeId");

-- AddForeignKey
ALTER TABLE "event_attendee" ADD CONSTRAINT "event_attendee_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "planner_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_attendee" ADD CONSTRAINT "event_attendee_attendeeId_fkey" FOREIGN KEY ("attendeeId") REFERENCES "attendee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
