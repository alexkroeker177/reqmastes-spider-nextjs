// app/api/auth/personio/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'


export async function GET(request: Request) {
  try {
    const clientId = process.env.clientId
    const clientSecret = process.env.clientSecret

    const response = await fetch(
      `https://api.personio.de/v1/auth?client_id=${clientId}&client_secret=${clientSecret}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      }
    )


    const data = await response.json()
    
    if (!response.ok || !data.success) {
      throw new Error(data.error?.message || 'Authentication failed')
    }

    const responseData = {
      success: true,
      data: {
        token: data.data.token,
      },
    }

    const cookieStore = await cookies()
    cookieStore.set('personio_access_token', data.data.token)
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Auth error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Authentication failed' },
      { status: 401 }
    )
  }
}