import type { NextApiRequest, NextApiResponse } from 'next';
import sql from '../db';
import { getUserFromRequest } from '../auth/jwt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = await getUserFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { userId: targetUserId } = req.query;

    // Check if requesting user has active subscription
    const users = await sql`
      SELECT subscription_status, subscription_expires_at 
      FROM users 
      WHERE id = ${userId}
    `;

    const hasActiveSubscription = 
      users[0].subscription_status === 'active' && 
      new Date(users[0].subscription_expires_at) > new Date();

    // Get target user
    const targetUsers = await sql`
      SELECT id, name, profile_photo, institution, verified, mode, bio, socials, distance_to_campus
      FROM users 
      WHERE id = ${targetUserId}
    `;

    if (targetUsers.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const targetUser = targetUsers[0];

    // If no active subscription, hide contact info
    if (!hasActiveSubscription) {
      return res.status(200).json({
        ...targetUser,
        contactsLocked: true,
        message: 'Subscribe to reveal contact details',
      });
    }

    // Return full user with contacts
    return res.status(200).json({
      ...targetUser,
      contactsLocked: false,
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    return res.status(500).json({ error: 'Failed to fetch contacts' });
  }
}
