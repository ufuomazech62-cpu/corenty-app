import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';

async function getUserId(req: VercelRequest): Promise<number | null> {
  let token: string | null = null;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    const cookies = req.headers.cookie || '';
    const match = cookies.match(/auth_token=([^;]+)/);
    if (match) token = match[1];
  }
  if (!token) return null;

  try {
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) return null;
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${payload}`).digest('base64url');
    if (signature !== expected) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (data.exp && data.exp < Math.floor(Date.now() / 1000)) return null;
    return data.userId;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = await getUserId(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const sql = neon(process.env.DATABASE_URL!);

    const users = await sql`
      SELECT id, email, name, profile_photo, institution, matric_number, verified,
             mode, onboarding_complete, bio, socials, distance_to_campus, budget,
             preferred_area as preferred_location, subscription_status, subscription_expires_at
      FROM users
      WHERE id = ${userId}
    `;

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(users[0]);
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ error: 'Failed to fetch user', details: error instanceof Error ? error.message : String(error) });
  }
}
