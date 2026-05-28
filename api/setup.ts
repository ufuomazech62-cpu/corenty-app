import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Simple auth check - require a secret token
  const { secret } = req.body;
  if (secret !== process.env.SETUP_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('Setting up database schema...');

    // Users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        google_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        profile_photo TEXT,
        institution VARCHAR(255),
        matric_number VARCHAR(100),
        verified BOOLEAN DEFAULT FALSE,
        mode VARCHAR(20),
        bio TEXT,
        socials JSONB DEFAULT '{}',
        distance_to_campus DECIMAL(4,2) DEFAULT 2.00,
        budget VARCHAR(50),
        preferred_area VARCHAR(255),
        subscription_status VARCHAR(20) DEFAULT 'inactive',
        subscription_expires_at TIMESTAMP WITH TIME ZONE,
        paystack_subscription_code VARCHAR(255),
        paystack_customer_code VARCHAR(255),
        onboarding_complete BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Listings table
    await sql`
      CREATE TABLE IF NOT EXISTS listings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        mode VARCHAR(20) NOT NULL,
        title VARCHAR(255),
        price VARCHAR(50),
        location VARCHAR(255),
        description TEXT,
        photos TEXT[] DEFAULT ARRAY[]::TEXT[],
        apartment_title VARCHAR(255),
        apartment_price VARCHAR(50),
        apartment_location VARCHAR(255),
        apartment_description TEXT,
        apartment_photos TEXT[] DEFAULT ARRAY[]::TEXT[],
        distance_to_campus DECIMAL(4,2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Matches table
    await sql`
      CREATE TABLE IF NOT EXISTS matches (
        id SERIAL PRIMARY KEY,
        user1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        user2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user1_id, user2_id, listing_id)
      )
    `;

    // Subscriptions table
    await sql`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        paystack_reference VARCHAR(255) UNIQUE NOT NULL,
        paystack_subscription_code VARCHAR(255),
        amount INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        starts_at TIMESTAMP WITH TIME ZONE,
        expires_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_listings_mode ON listings(mode)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id)`;

    console.log('Database schema setup complete!');
    return res.status(200).json({ success: true, message: 'Database schema created successfully' });
  } catch (error) {
    console.error('Database setup error:', error);
    return res.status(500).json({ error: 'Failed to setup database', details: error instanceof Error ? error.message : 'Unknown error' });
  }
}
