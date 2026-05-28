import { neon } from '@neondatabase/serverless';

// Database connection - uses environment variable, never hardcoded
const sql = neon(process.env.DATABASE_URL!);

export default sql;

// Helper types
export interface User {
  id: number;
  google_id: string;
  email: string;
  name: string;
  profile_photo: string | null;
  institution: string | null;
  matric_number: string | null;
  verified: boolean;
  mode: 'have' | 'need' | null;
  bio: string | null;
  socials: Record<string, string>;
  distance_to_campus: number;
  budget: string | null;
  preferred_area: string | null;
  subscription_status: 'active' | 'inactive' | 'cancelled';
  subscription_expires_at: string | null;
  paystack_subscription_code: string | null;
  paystack_customer_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: number;
  user_id: number;
  mode: 'have' | 'need';
  title: string | null;
  price: string | null;
  location: string | null;
  description: string | null;
  photos: string[];
  apartment_title: string | null;
  apartment_price: string | null;
  apartment_location: string | null;
  apartment_description: string | null;
  apartment_photos: string[];
  distance_to_campus: number | null;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: number;
  user1_id: number;
  user2_id: number;
  listing_id: number;
  created_at: string;
}

export interface Subscription {
  id: number;
  user_id: number;
  paystack_reference: string;
  paystack_subscription_code: string | null;
  amount: number;
  status: 'pending' | 'active' | 'cancelled' | 'expired';
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
}
