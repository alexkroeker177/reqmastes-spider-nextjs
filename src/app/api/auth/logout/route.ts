import { NextResponse } from 'next/server'
import { removeAuthCookie } from '@/app/utils/auth'

export async function POST() {
  try {
    removeAuthCookie()
    return NextResponse.json({ message: 'Logged out successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}
