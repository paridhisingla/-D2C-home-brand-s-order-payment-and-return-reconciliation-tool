// src/app/api/dashboard/route.ts
import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET() {
  try {
    const data = store.getDashboardData();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
