// src/app/api/seed/route.ts
import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function POST() {
  try {
    store.resetToDefaults();
    return NextResponse.json({
      success: true,
      message: 'Reconciliation database reset to pristine sample data with brief reference orders (ORD-W-204118, ORD-M-88120, ORD-W-204377)',
      totalOrders: store.getOrders().length,
      totalClaims: store.getClaims().length,
      currentUser: store.getCurrentUser(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return POST();
}
