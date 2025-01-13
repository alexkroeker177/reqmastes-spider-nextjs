import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

export async function createToken(payload: any) {
  const secret = new TextEncoder().encode(process.env.JWTSECRETKEY);
  
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('8h')
    .setIssuedAt()
    .sign(secret);

  return token;
}

export function setAuthCookie(token: string) {
  cookies().set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 8 * 60 * 60, // 8 hours
    path: '/',
  });
}

export function removeAuthCookie() {
  cookies().delete('token');
}