import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { getUserFromRequest } from '../../src/lib/jwt';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = await getUserFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { userId: targetUserId } = req.query;
    if (!targetUserId) {
      return res.status(400).json({ error: 'Missing target user ID' });
    }

    // Check if requesting user has active subscription
    const requestingUser = await sql`
      SELECT subscription_status, subscription_expires_at
      FROM users
      WHERE id = ${userId}
    `;

    if (requestingUser.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hasActiveSubscription =
      requestingUser[0].subscription_status === 'active' &&
      new Date(requestingUser[0].subscription_expires_at) > new Date();

    // Get target user's contact info
    const targetUser = await sql`
      SELECT socials FROM users WHERE id = ${targetUserId}
    `;

    if (targetUser.length === 0) {
      return res.status(404).json({ error: 'Target user not found' });
    }

    if (!hasActiveSubscription) {
      return res.status(403).json({
        error: 'Subscription required',
        message: 'You need an active subscription to view contact details'
      });
    }

    return res.status(200).json({ socials: targetUser[0].socials });
  } catch (error) {
    console.error('Get contacts error:', error);
    return res.status(500).json({ error: 'Failed to fetch contacts' });
  }
}
