import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, weddingTitle, pin } = body;

    if (!firstName || !weddingTitle || !pin) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (pin.length < 4) {
      return NextResponse.json(
        { error: 'PIN must be at least 4 digits' },
        { status: 400 }
      );
    }

    // Check if PIN already exists
    const existingPin = await prisma.organizer.findUnique({
      where: { pin },
    });

    if (existingPin) {
      return NextResponse.json(
        { error: 'This PIN is already in use. Please select a different PIN.' },
        { status: 409 }
      );
    }

    // Create new organizer
    const organizer = await prisma.organizer.create({
      data: {
        firstName,
        weddingTitle,
        pin,
      },
    });

    return NextResponse.json({
      organizerId: organizer.id,
      weddingTitle: organizer.weddingTitle,
    }, { status: 201 });
  } catch (error) {
    console.error('Error registering organizer:', error);
    return NextResponse.json(
      { error: 'Failed to register' },
      { status: 500 }
    );
  }
}
