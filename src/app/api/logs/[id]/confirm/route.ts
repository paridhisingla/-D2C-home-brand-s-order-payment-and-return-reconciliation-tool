import { NextResponse } from 'next/server';
import { confirmLogReview } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const updatedLog = await confirmLogReview({
      logId: params.id,
      confirmed: body.confirmed !== undefined ? body.confirmed : true,
      overrideCategory: body.overrideCategory,
      comments: body.comments,
    });

    return NextResponse.json({ success: true, log: updatedLog });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to review log' },
      { status: 500 }
    );
  }
}
