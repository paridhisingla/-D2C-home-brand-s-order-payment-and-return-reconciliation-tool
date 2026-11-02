import { NextResponse } from 'next/server';
import { updateExFactoryDate } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    if (!body.newExFactoryDate || !body.formalReason) {
      return NextResponse.json(
        { success: false, error: 'New ex-factory date and formal reason are required' },
        { status: 400 }
      );
    }

    const result = await updateExFactoryDate({
      orderId: params.id,
      newExFactoryDate: body.newExFactoryDate,
      formalReason: body.formalReason,
      changedByName: body.changedByName || 'Karthik Subramanian (Merchandiser)',
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update date' },
      { status: 500 }
    );
  }
}
