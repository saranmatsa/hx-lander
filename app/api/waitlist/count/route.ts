import { NextRequest, NextResponse } from 'next/server';
import { getWaitlistCount } from '@/lib/db';

export async function GET() {
  try {
    const count = await getWaitlistCount();
    return NextResponse.json({ count });
  } catch (err) {
    console.error('Failed to get count:', err);
    return NextResponse.json({ error: 'Failed to fetch waitlist count' }, { status: 500 });
  }
}