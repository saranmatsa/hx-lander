import { NextRequest, NextResponse } from 'next/server';
import { verifyCandidateCode, findCandidateByEmail } from '@/lib/db';

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
    const { email, code } = await request.json();
    if (!email || !code) {
      return NextResponse.json({ error: 'Email and verification code are required.' }, { status: 400 });
    }

    const result = await verifyCandidateCode(email, code);
    if (!result.success || !result.candidate) {
      return NextResponse.json({ error: result.error || 'Invalid verification code.' }, { status: 400 });
    }

    const candidate = result.candidate;

    return NextResponse.json({
      success: true,
      token: result.token,
      candidate: {
        candidateId: candidate.candidateId || candidate.id,
        status: candidate.status,
        joinedDate: formatJoinedDate(candidate.joinedAt),
        email: candidate.email,
      },
    });
  } catch (err) {
    console.error('Failed to verify code:', err);
    return NextResponse.json({ error: 'Internal server error during verification.' }, { status: 500 });
  }
}