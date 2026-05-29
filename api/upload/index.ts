import type { VercelRequest, VercelResponse } from '@vercel/node';
import { put } from '@vercel/blob';
import crypto from 'crypto';

// === Inlined JWT ===
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
async function verifyToken(token: string): Promise<{ userId: number } | null> {
  try {
    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) return null;
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${payload}`).digest('base64url');
    if (signature !== expected) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (data.exp && data.exp < Math.floor(Date.now() / 1000)) return null;
    return { userId: data.userId };
  } catch { return null; }
}
async function getUserFromRequest(req: any): Promise<number | null> {
  let token: string | null = null;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.substring(7);
  } else {
    const m = (req.headers.cookie || '').match(/auth_token=([^;]+)/);
    if (m) token = m[1];
  }
  if (!token) return null;
  const p = await verifyToken(token);
  return p?.userId ?? null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const userId = await getUserFromRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { filename, data, contentType } = req.body;

    if (!filename || !data) {
      return res.status(400).json({ error: 'Missing filename or data' });
    }

    const buffer = Buffer.from(data, 'base64');
    if (buffer.length === 0) return res.status(400).json({ error: 'Empty file' });

    const ct = contentType || detectContentType(filename);

    const blob = await put(filename, buffer, {
      access: 'public',
      contentType: ct,
    });

    return res.status(200).json({ url: blob.url });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Failed to upload file', details: error instanceof Error ? error.message : String(error) });
  }
}

function detectContentType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  const types: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml',
  };
  return types[ext || ''] || 'application/octet-stream';
}
