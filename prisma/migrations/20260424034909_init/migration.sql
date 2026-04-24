-- CreateTable
CREATE TABLE "PlannerEvent" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "attendees" TEXT[],
    "description" TEXT,
    "color" TEXT,

    CONSTRAINT "PlannerEvent_pkey" PRIMARY KEY ("id")
);
