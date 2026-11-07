// src/app/api/auth/route.ts
import { NextResponse } from 'next/server';
import { store, DEMO_USERS } from '@/lib/store';
import { UserRole } from '@/types';

export async function GET() {
  const user = store.getCurrentUser();
  return NextResponse.json({
    user,
    availableRoles: DEMO_USERS.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department,
    })),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { role, email } = body;

    let targetRole: UserRole = 'FINANCE_EXECUTIVE';
    if (role) {
      targetRole = role as UserRole;
    } else if (email) {
      const found = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (found) targetRole = found.role;
    }

    const updatedUser = store.switchUserRole(targetRole);
    return NextResponse.json({
      success: true,
      message: `Signed in as ${updatedUser.name} (${updatedUser.role})`,
      user: updatedUser,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Authentication error' }, { status: 400 });
  }
}
