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

const COLUMN_MAP: Record<string, string> = { preferred_location: 'preferred_area' };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'PUT') {
    try {
      const userId = await getUserFromRequest(req);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

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

  return res.status(405).json({ error: 'Method not allowed' });
}
