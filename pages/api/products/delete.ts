// pages/api/users/delete.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') return res.status(405).end('Method Not Allowed');

  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Token no proporcionado' });

  let currentUser;
  try {
    currentUser = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      role: string;
      officeId: number;
    };
  } catch {
    return res.status(401).json({ message: 'Token inválido' });
  }

  const id  = req.body.id; 

  if (!id) return res.status(400).json({ message: 'Falta el ID de producto' });

  const targetClient = await prisma.products.findUnique({ where: { id } });
  if (!targetClient) return res.status(404).json({ message: 'Producto no encontrado' });

  // solo se pueden eliminar productos de su misma oficina
  if (
    targetClient.office_id !== currentUser.officeId
  ) {
    return res.status(403).json({ message: 'No puedes eliminar productos de otra sucursal' });
  }

  try {
    await prisma.products.delete({ where: { id } });
    return res.status(200).json({ message: 'Producto eliminado correctamente' });
  } catch {
    return res.status(500).json({ message: 'Error al eliminar producto' });
  }
}
