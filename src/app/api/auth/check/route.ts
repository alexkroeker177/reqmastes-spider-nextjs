// app/api/auth/check/route.ts
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';
import { User } from '../types';

const ACCOUNTS_FILE = path.join(process.cwd(), 'src/app/api/auth/accounts.json');

export async function GET(request: Request) {
  try {
    // Get the token from the cookie
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const token = cookieHeader
      .split(';')
      .find(c => c.trim().startsWith('token='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Verify the token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = jwt.verify(token, jwtSecret) as { userId: string };

    // Get user data from accounts.json
    const fileContent = await fs.readFile(ACCOUNTS_FILE, 'utf-8');
    const data = JSON.parse(fileContent);
    const user = data.users.find((u: User) => u.username === decoded.userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Return user data (excluding sensitive information)
    return NextResponse.json({
      username: user.username,
      email: user.email
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
}