import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { getUserFromRequest } from '../auth/jwt';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    // Get subscription status
    try {
      const userId = await getUserFromRequest(req);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const result = await sql`
        SELECT subscription_status as status, subscription_expires_at as expires_at
        FROM users
        WHERE id = ${userId}
      `;

      if (result.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json(result[0]);
    } catch (error) {
      console.error('Get subscription status error:', error);
      return res.status(500).json({ error: 'Failed to fetch subscription status' });
    }
  }

  if (req.method === 'POST') {
    // Initialize subscription
    try {
      const userId = await getUserFromRequest(req);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get user email
      const users = await sql`SELECT email FROM users WHERE id = ${userId}`;
      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const email = users[0].email;

      // Initialize Paystack subscription
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          amount: 650000, // ₦6,500 in kobo
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
          metadata: {
            user_id: userId,
            subscription_type: 'monthly'
          }
        })
      });

      const data = await response.json();

      if (!data.status) {
        return res.status(400).json({ error: data.message || 'Failed to initialize payment' });
      }

      // Create subscription record
      await sql`
        INSERT INTO subscriptions (user_id, paystack_reference, amount, status)
        VALUES (${userId}, ${data.data.reference}, 650000, 'pending')
      `;

      return res.status(200).json({
        authorization_url: data.data.authorization_url,
        reference: data.data.reference
      });
    } catch (error) {
      console.error('Initialize subscription error:', error);
      return res.status(500).json({ error: 'Failed to initialize subscription' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
