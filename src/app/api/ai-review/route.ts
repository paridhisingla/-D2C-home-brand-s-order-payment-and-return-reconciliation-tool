// src/app/api/ai-review/route.ts
import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET() {
  try {
    const queue = store.getReviewQueue();
    return NextResponse.json({
      totalPending: queue.filter(q => q.status === 'PENDING').length,
      items: queue,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { itemId, action, manualOrderId, note } = body;

    if (!itemId || !action) {
      return NextResponse.json({ error: 'itemId and action are required' }, { status: 400 });
    }

    if (!['ACCEPT', 'REJECT', 'MANUAL_LINK'].includes(action)) {
      return NextResponse.json({ error: 'Action must be ACCEPT, REJECT, or MANUAL_LINK' }, { status: 400 });
    }

    const updatedItem = store.resolveReviewItem(itemId, action, manualOrderId, note);

    return NextResponse.json({
      success: true,
      message: `Review item ${action.toLowerCase()}ed successfully`,
      item: updatedItem,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
