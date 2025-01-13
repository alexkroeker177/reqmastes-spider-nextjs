// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import fs from 'fs/promises';
import path from 'path';
import { User } from '../types';

const ACCOUNTS_FILE = path.join(process.cwd(), 'app/api/auth/accounts.json');

export async function POST(request: Request) {
  try {
    const { username, password, email } = await request.json();

    // Validate input
    if (!username || !password || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Read existing users
    const fileContent = await fs.readFile(ACCOUNTS_FILE, 'utf-8');
    const data = JSON.parse(fileContent);

    // Check if user already exists
    if (data.users.some((user: User) => 
      user.username === username || user.email === email
    )) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = {
      username,
      password: hashedPassword,
      email
    };

    // Add to users array
    data.users.push(newUser);

    // Save back to file
    await fs.writeFile(ACCOUNTS_FILE, JSON.stringify(data, null, 2));

    return NextResponse.json(
      { message: 'User registered successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}