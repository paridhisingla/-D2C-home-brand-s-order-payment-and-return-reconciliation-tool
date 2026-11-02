import { NextResponse } from 'next/server';
import { getUnits } from '@/lib/db';

export async function GET() {
  try {
    const units = await getUnits();
    return NextResponse.json({ success: true, units });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch units' },
      { status: 500 }
    );
  }
}
