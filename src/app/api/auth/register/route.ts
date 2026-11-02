import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'knittrack-tiruppur-super-secret-jwt-key-2026';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, unitId, languagePreference } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { success: false, error: 'Name, email, password, and role are required' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: role.toUpperCase(),
      unitId: unitId || 'unit-1',
      languagePreference: languagePreference || (role === 'SUPERVISOR' ? 'ta' : 'en'),
      createdAt: new Date().toISOString(),
    };

    const token = jwt.sign(
      {
        userId: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        unitId: newUser.unitId,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    let redirectUrl = '/orders';
    if (newUser.role === 'SUPERVISOR') redirectUrl = '/supervisor';
    else if (newUser.role === 'BUYER') redirectUrl = '/buyer';
    else if (newUser.role === 'MD') redirectUrl = '/executive';

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: newUser,
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
      { success: false, error: err.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
