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
const COLUMN_MAP: Record<string, string> = { preferred_location: 'preferred_area' };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = await getUserFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'GET') {
    try {
      const users = await sql`SELECT id, email, name, profile_photo, profile_photos, institution, matric_number, verified, mode, onboarding_complete, bio, socials, distance_to_campus, budget, preferred_area, subscription_status, subscription_expires_at FROM users WHERE id = ${userId}`;
      if (users.length === 0) return res.status(404).json({ error: 'User not found' });
      return res.status(200).json(users[0]);
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const updates = req.body;
      const setClauses: string[] = [];
      const values: any[] = [];
      let pi = 1;

      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
          const dbColumn = COLUMN_MAP[key] || key;
          const dbValue = (typeof value === 'object' && value !== null && !Array.isArray(value)) ? JSON.stringify(value) : value;
          setClauses.push(`${dbColumn} = $${pi}`);
          values.push(dbValue);
          pi++;
        }
      }

      if (setClauses.length === 0) return res.status(400).json({ error: 'No updates provided' });
      setClauses.push(`updated_at = NOW()`);

      const query = `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${pi} RETURNING *`;
      values.push(userId);

      const result = await sql.query(query, values);
      if (result.length === 0) return res.status(404).json({ error: 'User not found' });
      return res.status(200).json(result[0]);
    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { confirm } = req.body || {};
      if (confirm !== 'DELETE') {
        return res.status(400).json({ error: 'Must confirm with body: { confirm: "DELETE" }' });
      }

      // Cascade: delete matches, listings, subscriptions, then user
      await sql`DELETE FROM matches WHERE user1_id = ${userId} OR user2_id = ${userId}`;
      await sql`DELETE FROM listings WHERE user_id = ${userId}`;
      await sql`DELETE FROM subscriptions WHERE user_id = ${userId}`;
      await sql`DELETE FROM users WHERE id = ${userId}`;

      return res.status(200).json({ success: true, message: 'Account deleted' });
    } catch (error) {
      console.error('Delete account error:', error);
      return res.status(500).json({ error: 'Failed to delete account' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
