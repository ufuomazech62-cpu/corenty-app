import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

// === Inlined JWT ===
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
async function verifyToken(token: string): Promise<{ userId: number } | null> {
  try {
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) return null;
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${payload}`).digest('base64url');
    if (signature !== expected) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (data.exp && data.exp < Math.floor(Date.now() / 1000)) return null;
    return { userId: data.userId };
  } catch { return null; }
}
async function getUserFromRequest(req: any): Promise<number | null> {
  let token: string | null = null;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.substring(7);
  } else {
    const m = (req.headers.cookie || '').match(/auth_token=([^;]+)/);
    if (m) token = m[1];
  }
  if (!token) return null;
  const p = await verifyToken(token);
  return p?.userId ?? null;
}

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const userId = await getUserFromRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { userId: targetUserId } = req.query;
    if (!targetUserId) return res.status(400).json({ error: 'Missing target user ID' });

    const requestingUser = await sql`SELECT subscription_status, subscription_expires_at FROM users WHERE id = ${userId}`;
    if (requestingUser.length === 0) return res.status(404).json({ error: 'User not found' });

    const hasActiveSubscription =
      requestingUser[0].subscription_status === 'active' &&
      new Date(requestingUser[0].subscription_expires_at) > new Date();

    const targetUser = await sql`SELECT socials FROM users WHERE id = ${targetUserId}`;
    if (targetUser.length === 0) return res.status(404).json({ error: 'Target user not found' });

    if (!hasActiveSubscription) {
      return res.status(403).json({ error: 'Subscription required', message: 'You need an active subscription to view contact details' });
    }

    return res.status(200).json({ socials: targetUser[0].socials });
  } catch (error) {
    console.error('Get contacts error:', error);
    return res.status(500).json({ error: 'Failed to fetch contacts' });
  }
}
