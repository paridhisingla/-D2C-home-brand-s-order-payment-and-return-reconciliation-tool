import { NextResponse } from 'next/server';
import { getBuyers } from '@/lib/db';

export async function GET() {
  try {
    const buyers = await getBuyers();
    return NextResponse.json({ success: true, buyers });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch buyers' },
      { status: 500 }
    );
  }
}
