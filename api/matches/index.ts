import type { NextApiRequest, NextApiResponse } from 'next';
import sql from '../db';
import { getUserFromRequest } from '../auth/jwt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Create match (swipe right)
    try {
      const userId = await getUserFromRequest(req);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { listingId } = req.body;

      // Get listing owner
      const listings = await sql`SELECT user_id FROM listings WHERE id = ${listingId}`;
      if (listings.length === 0) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      const listingOwnerId = listings[0].user_id;

      // Can't match with yourself
      if (listingOwnerId === userId) {
        return res.status(400).json({ error: 'Cannot match with yourself' });
      }

      // Check if already matched
      const existing = await sql`
        SELECT id FROM matches 
        WHERE (user1_id = ${userId} AND user2_id = ${listingOwnerId})
           OR (user1_id = ${listingOwnerId} AND user2_id = ${userId})
      `;

      if (existing.length > 0) {
        return res.status(200).json({ matched: true, alreadyMatched: true });
      }

      // Create match
      await sql`
        INSERT INTO matches (user1_id, user2_id, listing_id)
        VALUES (${userId}, ${listingOwnerId}, ${listingId})
      `;

      return res.status(201).json({ matched: true });
    } catch (error) {
      console.error('Create match error:', error);
      return res.status(500).json({ error: 'Failed to create match' });
    }
  }

  if (req.method === 'GET') {
    // Get user's matches
    try {
      const userId = await getUserFromRequest(req);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const matches = await sql`
        SELECT m.*, 
               u1.id as u1_id, u1.name as u1_name, u1.profile_photo as u1_photo,
               u2.id as u2_id, u2.name as u2_name, u2.profile_photo as u2_photo,
               l.* as listing
        FROM matches m
        JOIN users u1 ON m.user1_id = u1.id
        JOIN users u2 ON m.user2_id = u2.id
        JOIN listings l ON m.listing_id = l.id
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
