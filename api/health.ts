import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const envCheck = {
    DATABASE_URL: !!process.env.DATABASE_URL,
    JWT_SECRET: !!process.env.JWT_SECRET,
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    APP_URL: process.env.APP_URL,
  };

  res.status(200).json({
    status: 'ok',
    env: envCheck,
    time: new Date().toISOString(),
  });
}
