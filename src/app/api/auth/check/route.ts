// app/api/auth/check/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Verify the token
    const secret = new TextEncoder().encode(process.env.JWTSECRETKEY);
    const { payload } = await jwtVerify(token.value, secret);

    // Return user data from token
    return NextResponse.json({
      id: payload.id,
      email: payload.email,
      // Add any other user data you store in the token
    });
  } catch (error) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }
}