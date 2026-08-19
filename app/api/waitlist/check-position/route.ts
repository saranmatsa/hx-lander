import { NextRequest, NextResponse } from 'next/server';
import { checkCandidatePosition } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (!token || typeof token !== 'string' || !token.trim()) {
      return NextResponse.json({ error: 'Please enter your HX access token.' }, { status: 400 });
    }

    const positionInfo = await checkCandidatePosition(token.trim());
    if (!positionInfo) {
      return NextResponse.json(
        { error: 'Invalid or unknown HX access code. Please check that you copied the complete token.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: positionInfo });
  } catch (err) {
    console.error('Failed to check position:', err);
    return NextResponse.json({ error: 'Internal server error while retrieving position.' }, { status: 500 });
  }
}