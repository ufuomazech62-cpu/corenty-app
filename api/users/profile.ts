import type { NextApiRequest, NextApiResponse } from 'next'
import sql from '../db'
import { getUserFromRequest } from '../auth/jwt'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const userId = await getUserFromRequest(req)
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

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
      UPDATE users 
      SET ${setClauses.join(', ')}
      WHERE id = ${userId}
      RETURNING *
    `

    const result = await sql.query(query, values)

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.status(200).json(result.rows[0])
  } catch (error) {
    console.error('Update profile error:', error)
    return res.status(500).json({ error: 'Failed to update profile' })
  }
}
