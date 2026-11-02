import { NextResponse } from 'next/server';
import { addProductionLog, getReviewQueue } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const logs = await getReviewQueue();
    return NextResponse.json({ success: true, count: logs.length, logs });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.orderId || !body.stage || body.quantityProduced === undefined) {
      return NextResponse.json(
        { success: false, error: 'orderId, stage, and quantityProduced are required' },
        { status: 400 }
      );
    }

    const result = await addProductionLog({
      orderId: body.orderId,
      stage: body.stage,
      quantityProduced: Number(body.quantityProduced),
      rejectedQuantity: Number(body.rejectedQuantity || 0),
      photoUrl: body.photoUrl,
      originalTamilNote: body.originalTamilNote,
      voiceAudioUrl: body.voiceAudioUrl,
      supervisorId: body.supervisorId,
    });

    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to record production log' },
      { status: 500 }
    );
  }
}
