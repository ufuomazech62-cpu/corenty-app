import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
async function verifyToken(token: string): Promise<{ userId: number } | null> {
  try {
    const [h, p, s] = token.split('.');
    if (!h || !p || !s) return null;
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${h}.${p}`).digest('base64url');
    if (s !== expected) return null;
    const data = JSON.parse(Buffer.from(p, 'base64url').toString());
    if (data.exp && data.exp < Math.floor(Date.now() / 1000)) return null;
    return { userId: data.userId };
  } catch { return null; }
}
async function getUserFromRequest(req: any): Promise<number | null> {
  let token: string | null = null;
  if (req.headers.authorization?.startsWith('Bearer ')) token = req.headers.authorization.substring(7);
  else { const m = (req.headers.cookie || '').match(/auth_token=([^;]+)/); if (m) token = m[1]; }
  if (!token) return null;
  const p = await verifyToken(token);
  return p?.userId ?? null;
}

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const userId = await getUserFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { rating, message, category } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be 1-5' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Ensure feedback table exists
    await sql`
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        rating INTEGER NOT NULL,
        message TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'general',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`
      INSERT INTO feedback (user_id, rating, message, category)
      VALUES (${userId}, ${rating}, ${message.trim()}, ${category || 'general'})
    `;

    return res.status(201).json({ success: true, message: 'Feedback submitted. Thank you!' });
  } catch (error) {
    console.error('Feedback error:', error);
    return res.status(500).json({ error: 'Failed to submit feedback' });
  }
}
