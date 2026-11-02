import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { INITIAL_BUYERS } from '@/lib/sampleData';

const JWT_SECRET = process.env.JWT_SECRET || 'knittrack-tiruppur-super-secret-jwt-key-2026';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { buyerCodeOrPin } = body;

    if (!buyerCodeOrPin) {
      return NextResponse.json(
        { success: false, error: 'Buyer Access PIN or Buyer Code is required' },
        { status: 400 }
      );
    }

    const clean = buyerCodeOrPin.trim().toUpperCase();

    const buyer = INITIAL_BUYERS.find(
      (b) =>
        b.code.toUpperCase() === clean ||
        b.accessPin.toUpperCase() === clean ||
        b.id.toUpperCase() === clean
    );

    if (!buyer) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid buyer PIN or code. (Use BUYER-B-2026 for UK or BUYER-C-2026 for Germany)',
        },
        { status: 404 }
      );
    }

    const token = jwt.sign(
      {
        buyerId: buyer.id,
        name: buyer.name,
        role: 'buyer',
        country: buyer.country,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      buyer: {
        id: buyer.id,
        name: buyer.name,
        country: buyer.country,
        code: buyer.code,
      },
      token,
      redirectUrl: `/buyer?company=${buyer.id}&token=${token}`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Verification failed' },
      { status: 500 }
    );
  }
}
