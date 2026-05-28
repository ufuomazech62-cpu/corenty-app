-- CoRenty Production Database Schema
-- Run this on your Neon PostgreSQL database

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  google_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  profile_photo TEXT,
  institution VARCHAR(255),
  matric_number VARCHAR(100),
  verified BOOLEAN DEFAULT FALSE,
  mode VARCHAR(20), -- 'have' or 'need'
  bio TEXT,
  socials JSONB DEFAULT '{}',
  distance_to_campus DECIMAL(4,2) DEFAULT 2.00,
  budget VARCHAR(50),
  preferred_area VARCHAR(255),
  subscription_status VARCHAR(20) DEFAULT 'inactive', -- 'active', 'inactive', 'cancelled'
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  paystack_subscription_code VARCHAR(255),
  paystack_customer_code VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listings table
CREATE TABLE IF NOT EXISTS listings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  mode VARCHAR(20) NOT NULL, -- 'have' or 'need'
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
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id SERIAL PRIMARY KEY,
  user1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  user2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id, listing_id)
);

-- Subscriptions table (for tracking payment history)
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  paystack_reference VARCHAR(255) UNIQUE NOT NULL,
  paystack_subscription_code VARCHAR(255),
  amount INTEGER NOT NULL, -- in kobo (650000 = ₦6,500)
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'active', 'cancelled', 'expired'
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions table (for JWT token management)
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_mode ON listings(mode);
CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
