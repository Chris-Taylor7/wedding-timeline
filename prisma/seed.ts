import { PrismaClient } from "@prisma/client/extension"; // Adjust path to your generated folder
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // 1. Create 3 Organizers (Users/Weddings)
  const organizersData = [
    { firstName: "Alice", weddingTitle: "Alice & Bob's Big Day", pin: "1234" },
    { firstName: "Charlie", weddingTitle: "The Smith-Doe Wedding", pin: "5678" },
    { firstName: "Eve", weddingTitle: "Eve & Wall-E's Galactic Union", pin: "9999" },
  ];

  // 2. Create some sample Attendees
  const attendeesData = ["John Doe", "Jane Smith", "Sam Wilson", "Sara Connor"];
  const attendees = await Promise.all(
    attendeesData.map((name) =>
      prisma.attendee.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  for (const org of organizersData) {
    // Create the Organizer
    const organizer = await prisma.organizer.create({
      data: {
        firstName: org.firstName,
        weddingTitle: org.weddingTitle,
        pin: org.pin,
        events: {
          create: [
            {
              title: "Welcome Drinks",
              startTime: "18:00",
              endTime: "21:00",
              date: "2024-12-01",
              location: "The Rooftop Bar",
              description: "Kickoff drinks for early arrivals",
              color: "blue",
            },
            {
              title: "Main Ceremony",
              startTime: "15:00",
              endTime: "16:00",
              date: "2024-12-02",
              location: "The Grand Ballroom",
              description: "The big moment!",
              color: "gold",
            },
          ],
        },
      },
      include: {
        events: true,
      },
    });

    // 3. Link some attendees to the first event of each wedding for demonstration
    const firstEvent = organizer.events[0];
    await prisma.eventAttendee.createMany({
      data: [
        { eventId: firstEvent.id, attendeeId: attendees[0].id },
        { eventId: firstEvent.id, attendeeId: attendees[1].id },
      ],
    });

    console.log(`Created wedding: ${org.weddingTitle} for ${org.firstName}`);
  }

  console.log("Seeding finished!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });