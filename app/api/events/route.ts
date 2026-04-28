import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET all events with attendees for a specific organizer
export async function GET(request: NextRequest) {
  try {
    const organizerId = request.nextUrl.searchParams.get('organizerId');

    if (!organizerId) {
      return NextResponse.json(
        { error: 'organizerId is required' },
        { status: 400 }
      );
    }

    const events = await prisma.plannerEvent.findMany({
      where: {
        organizerId,
      },
      include: {
        attendees: {
          include: {
            attendee: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Transform to include attendee names and ids
    const formattedEvents = events.map((event) => ({
      ...event,
      attendeeIds: event.attendees.map((ea) => ea.attendee.name),
    }));

    return NextResponse.json(formattedEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST create new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      date,
      startTime,
      endTime,
      location,
      description,
      color,
      attendeeIds,
      organizerId,
    } = body;

    if (!organizerId) {
      return NextResponse.json(
        { error: 'organizerId is required' },
        { status: 400 }
      );
    }

    // Create event
    const event = await prisma.plannerEvent.create({
      data: {
        title,
        date,
        startTime,
        endTime,
        location,
        description: description || '',
        color: color || 'yellow',
        organizerId,
        attendees: {
          create: attendeeIds.map((attendeeName: string) => ({
            attendee: {
              connectOrCreate: {
                where: { name: attendeeName },
                create: { name: attendeeName },
              },
            },
          })),
        },
      },
      include: {
        attendees: {
          include: {
            attendee: true,
          },
        },
      },
    });

    // Format response
    const formattedEvent = {
      ...event,
      attendeeIds: event.attendees.map((ea) => ea.attendee.name),
    };

    return NextResponse.json(formattedEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
