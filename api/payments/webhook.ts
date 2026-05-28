import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify Paystack signature
    const signature = req.headers['x-paystack-signature'];
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== hash) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;

    if (event.event === 'charge.success') {
      const reference = event.data.reference;

      // Get subscription
      const subscriptions = await sql`
        SELECT user_id FROM subscriptions WHERE paystack_reference = ${reference}
      `;

      if (subscriptions.length === 0) {
        return res.status(404).json({ error: 'Subscription not found' });
      }

      const userId = subscriptions[0].user_id;

      // Update subscription status
      await sql`
        UPDATE subscriptions
        SET status = 'active', starts_at = NOW(), expires_at = NOW() + INTERVAL '30 days'
        WHERE paystack_reference = ${reference}
      `;

      // Update user subscription status
      await sql`
        UPDATE users
        SET subscription_status = 'active',
            subscription_expires_at = NOW() + INTERVAL '30 days',
            verified = TRUE,
            updated_at = NOW()
        WHERE id = ${userId}
      `;
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
}
