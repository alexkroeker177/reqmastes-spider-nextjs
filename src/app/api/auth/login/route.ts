// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';
import { User } from '../types';

const ACCOUNTS_FILE = path.join(process.cwd(), 'src/app/api/auth/accounts.json');

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    const fileContent = await fs.readFile(ACCOUNTS_FILE, 'utf-8');
    const data = JSON.parse(fileContent);

    const user = data.users.find((u: User) => u.username === username);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Make sure we're getting the secret
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const token = jwt.sign(
      { userId: user.username },
      jwtSecret,
      { expiresIn: '24h' }
    );

    const response = NextResponse.json(
      { 
        message: 'Login successful',
        token,
        user: { username: user.username, email: user.email }
      },
      { status: 200 }
    );

    // Set the token as an HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}