import type { NextApiRequest, NextApiResponse } from 'next'
import sql from '../../db'
import { getUserFromRequest } from '../../auth/jwt'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  const listingId = parseInt(id as string, 10)

  if (isNaN(listingId)) {
    return res.status(400).json({ error: 'Invalid listing ID' })
  }

  const userId = await getUserFromRequest(req)
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    try {
      const result = await sql`
        SELECT * FROM listings WHERE id = ${listingId}
      `

      if (result.length === 0) {
        return res.status(404).json({ error: 'Listing not found' })
      }

      return res.status(200).json(result[0])
    } catch (error) {
      console.error('Get listing error:', error)
      return res.status(500).json({ error: 'Failed to fetch listing' })
    }
  }

  if (req.method === 'PUT') {
    try {
      const updates = req.body

      // Build dynamic update query
      const setClauses: string[] = []
      const values: any[] = []
      let paramIndex = 1

      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined) {
          setClauses.push(`${key} = $${paramIndex}`)
          values.push(value)
          paramIndex++
        }
      }

      setClauses.push(`updated_at = NOW()`)

      const query = `
        UPDATE listings 
        SET ${setClauses.join(', ')}
        WHERE id = ${listingId} AND user_id = ${userId}
        RETURNING *
      `

      const result = await sql.query(query, values)

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Listing not found or not owned by user' })
      }

      return res.status(200).json(result.rows[0])
    } catch (error) {
      console.error('Update listing error:', error)
      return res.status(500).json({ error: 'Failed to update listing' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const result = await sql`
        DELETE FROM listings 
        WHERE id = ${listingId} AND user_id = ${userId}
        RETURNING id
      `

      if (result.length === 0) {
        return res.status(404).json({ error: 'Listing not found or not owned by user' })
      }

      return res.status(200).json({ success: true })
    } catch (error) {
      console.error('Delete listing error:', error)
      return res.status(500).json({ error: 'Failed to delete listing' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
