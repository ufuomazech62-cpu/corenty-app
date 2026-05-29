import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { getUserFromRequest } from '../auth/jwt';

const sql = neon(process.env.DATABASE_URL!);

// Map frontend field names to DB column names
const COLUMN_MAP: Record<string, string> = {
  preferred_location: 'preferred_area',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'PUT') {
    try {
      const userId = await getUserFromRequest(req);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const updates = req.body;

      // Build dynamic update query
      const setClauses: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
          const dbColumn = COLUMN_MAP[key] || key;
          // Stringify objects for JSONB columns
          const dbValue = (typeof value === 'object' && value !== null && !Array.isArray(value))
            ? JSON.stringify(value)
            : value;
          setClauses.push(`${dbColumn} = $${paramIndex}`);
          values.push(dbValue);
          paramIndex++;
        }
      }

      if (setClauses.length === 0) {
        return res.status(400).json({ error: 'No updates provided' });
      }

      setClauses.push(`updated_at = NOW()`);

      const query = `
        UPDATE users
        SET ${setClauses.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      values.push(userId);

      const result = await sql.query(query, values);

      if (result.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json(result[0]);
    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
