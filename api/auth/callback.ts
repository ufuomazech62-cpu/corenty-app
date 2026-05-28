import type { NextApiRequest, NextApiResponse } from 'next';
import sql from '../db';
import { createToken, setAuthCookie } from './jwt';

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens: GoogleTokenResponse = await tokenResponse.json();

    // Get user info
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to fetch user info');
    }

    const userInfo: GoogleUserInfo = await userInfoResponse.json();

    // Check if user exists
    const existingUser = await sql`
      SELECT id FROM users WHERE google_id = ${userInfo.sub}
    `;

    let userId: number;

    if (existingUser.length === 0) {
      // Create new user
      const newUser = await sql`
        INSERT INTO users (google_id, email, name, profile_photo)
        VALUES (${userInfo.sub}, ${userInfo.email}, ${userInfo.name}, ${userInfo.picture})
        RETURNING id
      `;
      userId = newUser[0].id;
    } else {
      // Update existing user
      await sql`
        UPDATE users 
        SET email = ${userInfo.email}, name = ${userInfo.name}, profile_photo = ${userInfo.picture}, updated_at = NOW()
        WHERE google_id = ${userInfo.sub}
      `;
      userId = existingUser[0].id;
    }

    // Create JWT token
    const token = await createToken(userId);
    
    // Set HTTP-only cookie
    setAuthCookie(res, token);

    // Redirect to dashboard
    res.redirect('/dashboard');
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect('/?error=auth_failed');
  }
}
