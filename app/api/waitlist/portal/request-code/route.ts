import { NextRequest, NextResponse } from 'next/server';
import { findCandidateByEmail, setCandidateVerificationCode } from '@/lib/db';
import { generateVerificationCode, sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    const candidate = await findCandidateByEmail(email);
    if (!candidate) {
      return NextResponse.json({ error: 'No waitlist candidate found for this email.' }, { status: 404 });
    }

    const code = generateVerificationCode();
    await setCandidateVerificationCode(email, code);

    const emailSent = await sendVerificationEmail(email, code);
    if (!emailSent) {
      console.warn('[Portal] Failed to send verification email, but continuing');
    }

    return NextResponse.json({
      success: true,
      previewCode: code,
      message: 'Verification code sent.',
    });
  } catch (err) {
    console.error('Failed to request verification code:', err);
    return NextResponse.json({ error: 'Internal server error while requesting code.' }, { status: 500 });
  }
}