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
  if (req.method === 'GET') {
    try {
      const userId = await getUserFromRequest(req);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const result = await sql`
        SELECT subscription_status as status, subscription_expires_at as expires_at
        FROM users WHERE id = ${userId}
      `;
      if (result.length === 0) return res.status(404).json({ error: 'User not found' });
      return res.status(200).json(result[0]);
    } catch (error) {
      console.error('Get subscription status error:', error);
      return res.status(500).json({ error: 'Failed to fetch subscription status' });
    }
  }

  if (req.method === 'POST') {
    try {
      const userId = await getUserFromRequest(req);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const users = await sql`SELECT email FROM users WHERE id = ${userId}`;
      if (users.length === 0) return res.status(404).json({ error: 'User not found' });

      const email = users[0].email;

      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          amount: 650000,
          callback_url: `${process.env.APP_URL}/?payment=success`,
          metadata: { user_id: userId, subscription_type: 'monthly' }
        })
      });

      const data = await response.json();
      if (!data.status) return res.status(400).json({ error: data.message || 'Failed to initialize payment' });

      await sql`INSERT INTO subscriptions (user_id, paystack_reference, amount, status) VALUES (${userId}, ${data.data.reference}, 650000, 'pending')`;

      return res.status(200).json({
        authorization_url: data.data.authorization_url,
        reference: data.data.reference
      });
    } catch (error) {
      console.error('Initialize subscription error:', error);
      return res.status(500).json({ error: 'Failed to initialize subscription' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
