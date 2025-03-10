import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Define public routes that don't need authentication
const publicRoutes = ['/', '/login', '/register', '/api/auth/login', '/api/auth/register']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Special handling for Personio API routes
  if (pathname.startsWith('/api/personio/')) {
    return handlePersonioRoute(request)
  }

  // Check for JWT token
  const token = request.cookies.get('token')?.value

  if (!token) {
    // Redirect to login if no token
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // Verify JWT token
    const secret = new TextEncoder().encode(process.env.JWTSECRETKEY)
    await jwtVerify(token, secret)
    return NextResponse.next()
  } catch (error) {
    // Token is invalid - redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

async function handlePersonioRoute(request: NextRequest) {
  // First verify JWT token as normal
  const jwtToken = request.cookies.get('token')?.value
  if (!jwtToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWTSECRETKEY)
    await jwtVerify(jwtToken, secret)

    // Now handle Personio token
    const personioToken = request.cookies.get('personio_access_token')
    
    if (!personioToken) {
      return NextResponse.json({ error: 'No Personio token' }, { status: 401 })
    }

    // Check if token is expired
    const tokenData = JSON.parse(atob(personioToken.value.split('.')[1]))
    const isExpired = tokenData.exp * 1000 < Date.now()

    if (isExpired) {
      const refreshToken = request.cookies.get('personio_refresh_token')
      
      if (!refreshToken) {
        return NextResponse.json({ error: 'Personio session expired' }, { status: 401 })
      }

      // Attempt to refresh token
      const tokenResponse = await fetch(`${request.nextUrl.origin}/api/auth/personio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken.value }),
      })

      const newTokens = await tokenResponse.json()

      if (!tokenResponse.ok) {
        return NextResponse.json({ error: 'Failed to refresh Personio token' }, { status: 401 })
      }

      // Add new token to request headers
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('Authorization', `Bearer ${newTokens.access_token}`)

      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })

      // Set new cookies
      response.cookies.set('personio_access_token', newTokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: newTokens.expires_in
      })

      response.cookies.set('personio_refresh_token', newTokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 // 30 days
      })

      return response
    }

    // Token is valid, add it to request header
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('Authorization', `Bearer ${personioToken.value}`)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: ['/((?!_next/static|favicon.ico).*)'],
}