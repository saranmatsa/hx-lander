import { NextRequest, NextResponse } from 'next/server';
import { registerOrGetCandidateWithToken } from '@/lib/db';

function formatJoinedDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'August 15, 2026';
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    const { candidate, token, isNew } = await registerOrGetCandidateWithToken(email);
    return NextResponse.json({
      success: true,
      isNew,
      token,
      candidateId: candidate.candidateId || candidate.id,
      candidate: {
        candidateId: candidate.candidateId || candidate.id,
        email: candidate.email,
        joinedAt: candidate.joinedAt,
        joinedDate: formatJoinedDate(candidate.joinedAt),
        status: candidate.status || 'ACTIVE',
      },
    });
  } catch (err) {
    console.error('Failed to add to waitlist:', err);
    return NextResponse.json({ error: 'Internal server error while joining waitlist.' }, { status: 500 });
  }
}