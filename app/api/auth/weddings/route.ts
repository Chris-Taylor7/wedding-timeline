import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch all organizers to show wedding titles for guest view
    const organizers = await prisma.organizer.findMany({
      select: {
        id: true,
        weddingTitle: true,
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
