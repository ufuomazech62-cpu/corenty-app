import type { NextApiRequest, NextApiResponse } from 'next';
import sql from '../db';
import { getUserFromRequest } from '../auth/jwt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = await getUserFromRequest(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user email
    const users = await sql`SELECT email, paystack_customer_code FROM users WHERE id = ${userId}`;
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { email, paystack_customer_code } = users[0];

    // Check if user already has active subscription
    const activeSubs = await sql`
      SELECT * FROM subscriptions 
      WHERE user_id = ${userId} AND status = 'active' AND expires_at > NOW()
    `;

    if (activeSubs.length > 0) {
      return res.status(400).json({ error: 'Already has active subscription' });
    }

    // Create Paystack subscription
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: 650000, // ₦6,500 in kobo
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
        metadata: {
          user_id: userId,
          subscription_type: 'monthly',
        },
      }),
    });

    const data = await response.json();

    if (!data.status) {
      throw new Error(data.message || 'Paystack initialization failed');
    }

    // Create pending subscription record
    await sql`
      INSERT INTO subscriptions (user_id, paystack_reference, amount, status)
      VALUES (${userId}, ${data.data.reference}, 650000, 'pending')
    `;

    return res.status(200).json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    return res.status(500).json({ error: 'Failed to initialize subscription' });
  }
}
