import type { NextApiRequest, NextApiResponse } from 'next';
import sql from '../db';
import { getUserFromRequest } from './jwt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = await getUserFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const users = await sql`
      SELECT id, email, name, profile_photo, institution, matric_number, verified, 
             mode, bio, socials, distance_to_campus, budget, preferred_area,
             subscription_status, subscription_expires_at
      FROM users 
      WHERE id = ${userId}
    `;

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(users[0]);
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
