import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-change-in-production');

export async function createToken(userId: number): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<{ userId: number } | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return { userId: verified.payload.userId as number };
  } catch {
    return null;
  }
}

export async function getUserFromRequest(req: VercelRequest): Promise<number | null> {
  // Check Authorization header first (Bearer token)
  const authHeader = req.headers.authorization;
  let token: string | null = null;

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    // Fall back to cookie (set by OAuth callback)
    const cookies = req.headers.cookie || '';
    const match = cookies.match(/auth_token=([^;]+)/);
    if (match) token = match[1];
  }

  if (!token) return null;

  const payload = await verifyToken(token);
  return payload?.userId ?? null;
}
