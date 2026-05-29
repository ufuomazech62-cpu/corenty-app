import type { VercelRequest, VercelResponse } from '@vercel/node';
import { neon } from '@neondatabase/serverless';
import { createToken } from './jwt';

const sql = neon(process.env.DATABASE_URL!);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${process.env.APP_URL}/api/auth/callback`
      })
    });

    const tokens = await tokenResponse.json();

    if (!tokens.access_token) {
      return res.status(400).json({ error: 'Failed to get access token' });
    }

    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });

    const googleUser = await userResponse.json();

    if (!googleUser.email) {
      return res.status(400).json({ error: 'Failed to get user info' });
    }

    // Check if user exists
    const existingUser = await sql`
      SELECT id, onboarding_complete FROM users WHERE email = ${googleUser.email}
    `;

    let userId: number;

    if (existingUser.length === 0) {
      // Create new user
      const newUser = await sql`
        INSERT INTO users (google_id, email, name, profile_photo)
        VALUES (${googleUser.id}, ${googleUser.email}, ${googleUser.name}, ${googleUser.picture})
        RETURNING id, onboarding_complete
      `;
      userId = newUser[0].id;
    } else {
      // Update existing user
      const updatedUser = await sql`
        UPDATE users
        SET google_id = ${googleUser.id}, name = ${googleUser.name}, profile_photo = ${googleUser.picture}, updated_at = NOW()
        WHERE email = ${googleUser.email}
        RETURNING id, onboarding_complete
      `;
      userId = updatedUser[0].id;
    }

    // Create JWT token
    const token = await createToken(userId);

    // Set cookie
    res.setHeader('Set-Cookie', `auth_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`);

    // Redirect to SPA root — frontend router handles the rest
    res.redirect('/');
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect('/?error=oauth_failed');
  }
}
