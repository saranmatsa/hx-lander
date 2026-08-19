import { NextRequest, NextResponse } from 'next/server';
import { getPublicRoster, getWaitlistCount } from '@/lib/db';

export async function GET() {
  try {
    const [roster, count] = await Promise.all([getPublicRoster(), getWaitlistCount()]);
    return NextResponse.json({ roster, count });
  } catch (err) {
    console.error('Failed to get roster:', err);
    return NextResponse.json({ error: 'Failed to fetch roster' }, { status: 500 });
  }
}