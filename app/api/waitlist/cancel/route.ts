import { NextRequest, NextResponse } from 'next/server';
import { cancelCandidatePosition } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    if (!token || typeof token !== 'string' || !token.trim()) {
      return NextResponse.json({ error: 'Please provide your HX access token to cancel.' }, { status: 400 });
    }

    const updated = await cancelCandidatePosition(token.trim());
    if (!updated) {
      return NextResponse.json(
        { error: 'Invalid or unknown access token. Unable to cancel position.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Your waitlist position has been cancelled.',
      data: updated,
    });
  } catch (err) {
    console.error('Failed to cancel position:', err);
    return NextResponse.json({ error: 'Internal server error while cancelling position.' }, { status: 500 });
  }
}