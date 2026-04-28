import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const organizers = await prisma.organizer.findMany({
      select: {
        id: true,
        weddingTitle: true,
        // Instead of 'include', you select the relation directly
        events: {
          select: {
            id: true,
            title: true,
            date: true,
            startTime: true,
            endTime: true,
            location: true,
            description: true,
            color: true,
          },
        },
      },
    });

    return NextResponse.json(organizers);
  } catch (error) {
    console.error('Error fetching weddings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weddings' },
      { status: 500 }
    );
  }
}
