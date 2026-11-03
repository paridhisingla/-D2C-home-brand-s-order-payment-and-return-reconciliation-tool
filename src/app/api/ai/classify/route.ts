import { NextResponse } from 'next/server';
import { classifyTamilNote } from '@/lib/aiClassifier';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const note = body.note || body.tamilNote || '';

    const classification = classifyTamilNote(note);
    return NextResponse.json({
      success: true,
      classification: {
        ...classification,
        category: classification.predictedCategory,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'AI Classification failed' },
      { status: 500 }
    );
  }
}
