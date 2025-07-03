import { serialize } from 'cookie';
import type { NextApiRequest, NextApiResponse } from 'next';

// Endpoint para cerrar sesión eliminando la cookie
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Serializa una cookie vacía con expiración inmediata
  const cookie = serialize('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
    path: '/',
  });

  res.setHeader('Set-Cookie', cookie);
  return res.status(200).json({ message: 'Logged out' });
}
