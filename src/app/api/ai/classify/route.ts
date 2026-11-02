import { NextResponse } from 'next/server';
import { classifyTamilNote } from '@/lib/aiClassifier';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const note = body.note || '';

    const classification = classifyTamilNote(note);
    return NextResponse.json({ success: true, classification });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'AI Classification failed' },
      { status: 500 }
    );
  }
}
