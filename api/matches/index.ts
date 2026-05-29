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
  const userId = await getUserFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'POST') {
    try {
      const { listingId } = req.body;
      if (!listingId) return res.status(400).json({ error: 'Missing listing ID' });

      const listings = await sql`SELECT user_id FROM listings WHERE id = ${listingId}`;
      if (listings.length === 0) return res.status(404).json({ error: 'Listing not found' });

      const listingOwnerId = listings[0].user_id;

      const existingMatch = await sql`
        SELECT id FROM matches
        WHERE (user1_id = ${userId} AND user2_id = ${listingOwnerId})
           OR (user1_id = ${listingOwnerId} AND user2_id = ${userId})
      `;

      if (existingMatch.length > 0) return res.status(200).json({ matched: true, alreadyMatched: true });

      await sql`INSERT INTO matches (user1_id, user2_id, listing_id) VALUES (${userId}, ${listingOwnerId}, ${listingId})`;
      return res.status(201).json({ matched: true });
    } catch (error) {
      console.error('Create match error:', error);
      return res.status(500).json({ error: 'Failed to create match' });
    }
  }

  if (req.method === 'GET') {
    try {
      const matches = await sql`
        SELECT m.*, u1.name as u1_name, u1.profile_photo as u1_photo, u2.name as u2_name, u2.profile_photo as u2_photo
        FROM matches m
        JOIN users u1 ON m.user1_id = u1.id
        JOIN users u2 ON m.user2_id = u2.id
        WHERE m.user1_id = ${userId} OR m.user2_id = ${userId}
        ORDER BY m.created_at DESC
      `;
      return res.status(200).json(matches);
    } catch (error) {
      console.error('Get matches error:', error);
      return res.status(500).json({ error: 'Failed to fetch matches' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
