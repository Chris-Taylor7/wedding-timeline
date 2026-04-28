import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pin } = body;

    if (!pin) {
      return NextResponse.json(
        { error: 'PIN is required' },
        { status: 400 }
      );
    }

    // Find organizer by PIN
    const organizer = await prisma.organizer.findFirst({
      where: { pin },
      include: {
        events: { select: { id: true, title: true, date: true, startTime: true, endTime: true, location: true, description: true, color: true } },
      },
    });

    if (!organizer) {
      return NextResponse.json(
        { error: 'Invalid PIN' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      organizerId: organizer.id,
      weddingTitle: organizer.weddingTitle,
      firstName: organizer.firstName,
    });
  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
