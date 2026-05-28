import { SignJWT, jwtVerify } from 'jose';
import { NextApiRequest, NextApiResponse } from 'next';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function createToken(userId: number): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .setIssuedAt()
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<{ userId: number } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: number };
  } catch {
    return null;
  }
}

export async function getUserFromRequest(req: NextApiRequest): Promise<number | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  
  const token = authHeader.substring(7);
  const payload = await verifyToken(token);
  return payload?.userId ?? null;
}

export function setAuthCookie(res: NextApiResponse, token: string) {
  res.setHeader('Set-Cookie', `auth_token=${token}; HttpOnly; Path=/; Max-Age=${30 * 24 * 60 * 60}; SameSite=Lax; Secure`);
}

export function clearAuthCookie(res: NextApiResponse) {
  res.setHeader('Set-Cookie', `auth_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure`);
}

export function getAuthCookie(req: NextApiRequest): string | null {
  const cookies = req.headers.cookie?.split(';').map(c => c.trim());
  const authCookie = cookies?.find(c => c.startsWith('auth_token='));
  return authCookie?.split('=')[1] ?? null;
}
