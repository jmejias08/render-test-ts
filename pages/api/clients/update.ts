import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') return res.status(405).end('Method Not Allowed');

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

  const { id, name, id_card, phone, email, address} = req.body;

  if (!id || !name || !id_card || !phone || !email || !address) {
    return res.status(400).json({ message: 'Faltan datos' });
  }

  try {
    const existingClient = await prisma.clients.findUnique({ where: { id } });

    if (!existingClient) return res.status(404).json({ message: 'Cliente no encontrado' });

    // Admin solo puede editar usuarios de su oficina
    if (
      existingClient.office_id !== currentUser.officeId
    ) {
      return res.status(403).json({ message: 'No puedes editar  de otra sucursal' });
    }

    const updated = await prisma.clients.update({
      where: { id },
      data: { name, id_card, phone, email, address },
    });

    return res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}
