import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { INITIAL_USERS, INITIAL_BUYERS } from '@/lib/sampleData';

const JWT_SECRET = process.env.JWT_SECRET || 'knittrack-tiruppur-super-secret-jwt-key-2026';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if buyer signing in
    const buyer = INITIAL_BUYERS.find(
      (b) => b.contactEmail.toLowerCase() === cleanEmail || b.accessPin.toLowerCase() === password.toLowerCase()
    );

    if (buyer) {
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

      const response = NextResponse.json({
        success: true,
        user: {
          id: buyer.id,
          name: buyer.name,
          email: buyer.contactEmail,
          role: 'BUYER',
          country: buyer.country,
        },
        token,
        redirectUrl: `/buyer?company=${buyer.id}&token=${token}`,
      });

      response.cookies.set('knittrack_token', token, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });

      return response;
    }

    // Check user roster
    const user = INITIAL_USERS.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User account not found. Try one of the demo accounts.' },
        { status: 401 }
      );
    }

    // For demo convenience, password "demo123" is accepted
    const isPasswordValid = password === 'demo123' || (await bcrypt.compare(password, '$2a$10$demoHashPlaceholder'));
    if (!isPasswordValid && password !== 'demo123') {
      return NextResponse.json(
        { success: false, error: 'Invalid password. (Hint: all demo accounts use password "demo123")' },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        unitId: user.unitId,
        buyerCompanyId: user.buyerCompanyId,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Determine redirect
    let redirectUrl = '/orders';
    if (user.role === 'SUPERVISOR') redirectUrl = '/supervisor';
    else if (user.role === 'BUYER') redirectUrl = `/buyer?company=${user.buyerCompanyId || 'buyer-b-uk'}`;
    else if (user.role === 'MD') redirectUrl = '/executive';

    const response = NextResponse.json({
      success: true,
      user,
      token,
      redirectUrl,
    });

    response.cookies.set('knittrack_token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
