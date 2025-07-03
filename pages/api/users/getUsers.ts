import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed');

  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Token no proporcionado' });

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      role: 'super' | 'admin' | 'employee';
      officeId: number;
    };

    if (user.role === 'employee') {
      return res.status(403).json({ message: 'No autorizado' });
    }

    const users = await prisma.users.findMany({
      where: { office_id: user.officeId },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        office_id: true,
      },
    });

    return res.status(200).json(users);
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}
