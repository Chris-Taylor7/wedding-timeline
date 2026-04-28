import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventPositions, organizerId } = body;

    if (!eventPositions || !Array.isArray(eventPositions) || !organizerId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update positions for all events
    const updatePromises = eventPositions.map((item: { id: string; position: number }) =>
      prisma.plannerEvent.update({
        where: { id: item.id },
        data: { position: item.position },
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating event positions:', error);
    return NextResponse.json(
      { error: 'Failed to update event positions' },
      { status: 500 }
    );
  }
}
