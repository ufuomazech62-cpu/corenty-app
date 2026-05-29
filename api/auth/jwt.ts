import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';

function base64url(str: string): string {
  return Buffer.from(str).toString('base64url');
}

export async function createToken(userId: number): Promise<string> {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64url(JSON.stringify({
    userId,
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    iat: Math.floor(Date.now() / 1000)
  }));

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

export async function verifyToken(token: string): Promise<{ userId: number } | null> {
  try {
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) return null;

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());

    if (data.exp && data.exp < Math.floor(Date.now() / 1000)) return null;

    return { userId: data.userId };
  } catch {
    return null;
  }
}

export async function getUserFromRequest(req: VercelRequest): Promise<number | null> {
  const authHeader = req.headers.authorization;
  let token: string | null = null;

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    const cookies = req.headers.cookie || '';
    const match = cookies.match(/auth_token=([^;]+)/);
    if (match) token = match[1];
  }

  if (!token) return null;

  const payload = await verifyToken(token);
  return payload?.userId ?? null;
}
