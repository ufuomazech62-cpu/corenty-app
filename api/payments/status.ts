import type { NextApiRequest, NextApiResponse } from 'next'
import sql from '../db'
import { getUserFromRequest } from '../auth/jwt'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const userId = await getUserFromRequest(req)
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const result = await sql`
      SELECT subscription_status as status, subscription_expires_at as expires_at
      FROM users
      WHERE id = ${userId}
    `

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    return res.status(200).json(result[0])
  } catch (error) {
    console.error('Get subscription status error:', error)
    return res.status(500).json({ error: 'Failed to fetch subscription status' })
  }
}
