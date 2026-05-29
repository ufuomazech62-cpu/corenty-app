import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { getUserFromRequest } from '../../src/lib/jwt';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = await getUserFromRequest(req);
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
