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

// Full user fields for listing joins
const USER_FIELDS = 'u.name as u_name, u.profile_photo as u_photo, u.profile_photos as u_photos, u.institution, u.matric_number, u.verified, u.bio as u_bio, u.socials as u_socials, u.mode as u_mode, u.budget as u_budget, u.preferred_area as u_preferred_area';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = await getUserFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  if (req.method === 'POST') {
    try {
      const { mode, title, price, location, description, photos, apartment_title, apartment_price, apartment_location, apartment_description, apartment_photos, distance_to_campus } = req.body;
      const listing = await sql`
        INSERT INTO listings (user_id, mode, title, price, location, description, photos, apartment_title, apartment_price, apartment_location, apartment_description, apartment_photos, distance_to_campus)
        VALUES (${userId}, ${mode}, ${title}, ${price}, ${location}, ${description}, ${photos || []}, ${apartment_title}, ${apartment_price}, ${apartment_location}, ${apartment_description}, ${apartment_photos || []}, ${distance_to_campus})
        RETURNING *
      `;
      return res.status(201).json(listing[0]);
    } catch (error) {
      console.error('Create listing error:', error);
      return res.status(500).json({ error: 'Failed to create listing' });
    }
  }

  if (req.method === 'GET') {
    const { id, mine } = req.query;
    if (mine === 'true') {
      // User's own listings
      try {
        const listings = await sql`
          SELECT l.*, u.name as u_name, u.profile_photo as u_photo, u.institution, u.verified
          FROM listings l JOIN users u ON l.user_id = u.id WHERE l.user_id = ${userId}
          ORDER BY l.created_at DESC
        `;
        return res.status(200).json(listings);
      } catch (error) {
        console.error('Get my listings error:', error);
        return res.status(500).json({ error: 'Failed to fetch listings' });
      }
    }
    if (id) {
      try {
        const listings = await sql`
          SELECT l.*, ${sql.raw(USER_FIELDS)}
          FROM listings l JOIN users u ON l.user_id = u.id WHERE l.id = ${id}
        `;
        if (listings.length === 0) return res.status(404).json({ error: 'Listing not found' });
        return res.status(200).json(listings[0]);
      } catch (error) {
        console.error('Get listing error:', error);
        return res.status(500).json({ error: 'Failed to fetch listing' });
      }
    } else {
      try {
        const listings = await sql`
          SELECT l.*, ${sql.raw(USER_FIELDS)}
          FROM listings l JOIN users u ON l.user_id = u.id WHERE l.user_id != ${userId}
          ORDER BY l.created_at DESC LIMIT 50
        `;
        return res.status(200).json(listings);
      } catch (error) {
        console.error('Get listings error:', error);
        return res.status(500).json({ error: 'Failed to fetch listings' });
      }
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, ...updates } = req.body;
      const setClauses: string[] = [];
      const values: any[] = [];
      let pi = 1;
      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) { setClauses.push(`${key} = $${pi}`); values.push(value); pi++; }
      }
      setClauses.push(`updated_at = NOW()`);
      const query = `UPDATE listings SET ${setClauses.join(', ')} WHERE id = $${pi} AND user_id = $${pi + 1} RETURNING *`;
      values.push(id, userId);
      const result = await sql.query(query, values);
      if (result.length === 0) return res.status(404).json({ error: 'Listing not found' });
      return res.status(200).json(result[0]);
    } catch (error) {
      console.error('Update listing error:', error);
      return res.status(500).json({ error: 'Failed to update listing' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      await sql`DELETE FROM listings WHERE id = ${id} AND user_id = ${userId}`;
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Delete listing error:', error);
      return res.status(500).json({ error: 'Failed to delete listing' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
