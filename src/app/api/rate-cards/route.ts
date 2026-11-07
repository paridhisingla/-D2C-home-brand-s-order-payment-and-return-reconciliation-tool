// src/app/api/rate-cards/route.ts
import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { calculateExpectedPayout } from '@/lib/rateEngine';

export async function GET() {
  try {
    const rateCards = store.getRateCards();
    return NextResponse.json({ rateCards });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json({ error: 'id and updates object are required' }, { status: 400 });
    }

    const updated = store.updateRateCard(id, updates);
    return NextResponse.json({
      success: true,
      message: `Rate card ${updated.name} updated and all orders re-evaluated`,
      rateCard: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rateCards = store.getRateCards();
    const simulation = calculateExpectedPayout(body, rateCards);

    return NextResponse.json({
      success: true,
      simulation,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
