// src/app/api/reconciliation/route.ts
import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get('channel') || 'ALL';
    const status = searchParams.get('status') || 'ALL';
    const search = searchParams.get('search') || '';
    const diffThreshold = searchParams.has('diffThreshold')
      ? parseFloat(searchParams.get('diffThreshold')!)
      : undefined;
    const maskPII = searchParams.get('maskPII') !== 'false';

    const orders = store.getOrders({
      channel,
      status,
      search,
      differenceThreshold: diffThreshold,
      maskPII,
    });

    return NextResponse.json({
      totalCount: orders.length,
      orders,
      maskPII,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, action } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    if (action === 'RAISE_CLAIM') {
      const claim = store.createClaimFromOrder(orderId, body.customNotes);
      return NextResponse.json({
        success: true,
        message: `Claim ${claim.claimNumber} generated with evidence dossier`,
        claim,
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
