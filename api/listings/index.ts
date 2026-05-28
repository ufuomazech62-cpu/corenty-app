import type { NextApiRequest, NextApiResponse };
import sql from '../db';
import { getUserFromRequest } from '../auth/jwt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = await getUserFromRequest(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    // Create listing
    try {
      const {
        mode, title, price, location, description, photos,
        apartment_title, apartment_price, apartment_location, 
        apartment_description, apartment_photos, distance_to_campus
      } = req.body;

      const listing = await sql`
        INSERT INTO listings (
          user_id, mode, title, price, location, description, photos,
          apartment_title, apartment_price, apartment_location,
          apartment_description, apartment_photos, distance_to_campus
        ) VALUES (
          ${userId}, ${mode}, ${title}, ${price}, ${location}, ${description}, ${photos || []},
          ${apartment_title}, ${apartment_price}, ${apartment_location},
          ${apartment_description}, ${apartment_photos || []}, ${distance_to_campus}
        )
        RETURNING *
      `;

      return res.status(201).json(listing[0]);
    } catch (error) {
      console.error('Create listing error:', error);
      return res.status(500).json({ error: 'Failed to create listing' });
    }
  }

  if (req.method === 'GET') {
    // Get all listings (excluding user's own) for dashboard feed
    try {
      const listings = await sql`
        SELECT l.*, u.name as u_name, u.profile_photo as u_photo, u.institution, u.verified
        FROM listings l
        JOIN users u ON l.user_id = u.id
        WHERE l.user_id != ${userId}
        ORDER BY l.created_at DESC
        LIMIT 50
      `;
      return res.status(200).json(listings);
    } catch (error) {
      console.error('Get listings error:', error);
      return res.status(500).json({ error: 'Failed to fetch listings' });
    }
  }

  if (req.method === 'PUT') {
    // Update listing
    try {
      const { id, ...updates } = req.body;
      
      const listing = await sql`
        UPDATE listings 
        SET ${sql(updates)}, updated_at = NOW()
        WHERE id = ${id} AND user_id = ${userId}
        RETURNING *
      `;

      if (listing.length === 0) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      return res.status(200).json(listing[0]);
    } catch (error) {
      console.error('Update listing error:', error);
      return res.status(500).json({ error: 'Failed to update listing' });
    }
  }

  if (req.method === 'DELETE') {
    // Delete listing
    try {
      const { id } = req.query;
      
      await sql`
        DELETE FROM listings WHERE id = ${id} AND user_id = ${userId}
      `;

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Delete listing error:', error);
      return res.status(500).json({ error: 'Failed to delete listing' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
