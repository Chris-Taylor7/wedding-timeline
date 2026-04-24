import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET single event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const event = await prisma.plannerEvent.findUnique({
      where: { id },
      include: {
        attendees: {
          include: {
            attendee: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Format response
    const formattedEvent = {
      ...event,
      attendeeIds: event.attendees.map((ea) => ea.attendee.name),
    };

    return NextResponse.json(formattedEvent);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

// PUT update event
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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
    } = body;

    // Delete existing attendee relationships
    await prisma.eventAttendee.deleteMany({
      where: { eventId: id },
    });

    // Update event with new attendees
    const event = await prisma.plannerEvent.update({
      where: { id },
      data: {
        title,
        date,
        startTime,
        endTime,
        location,
        description: description || '',
        color: color || 'yellow',
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

    return NextResponse.json(formattedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

// DELETE event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.plannerEvent.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Event deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
