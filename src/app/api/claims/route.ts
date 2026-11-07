// src/app/api/claims/route.ts
import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { ClaimRecord } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const partner = searchParams.get('partner') || 'ALL';
    const status = searchParams.get('status') || 'ALL';

    const claims = store.getClaims(partner, status);
    return NextResponse.json({
      totalCount: claims.length,
      claims,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, customNotes } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const claim = store.createClaimFromOrder(orderId, customNotes);
    return NextResponse.json({
      success: true,
      message: `Claim ${claim.claimNumber} filed successfully`,
      claim,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { claimId, status, settlementUtr, recoveredAmount } = body;

    if (!claimId || !status) {
      return NextResponse.json({ error: 'claimId and status are required' }, { status: 400 });
    }

    const updatedClaim = store.updateClaimStatus(
      claimId,
      status as ClaimRecord['status'],
      settlementUtr,
      recoveredAmount
    );

    return NextResponse.json({
      success: true,
      message: `Claim ${updatedClaim.claimNumber} updated to ${status}`,
      claim: updatedClaim,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
