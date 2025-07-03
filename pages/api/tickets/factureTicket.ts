// /pages/api/tickets/factureTicket.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') return res.status(405).end('Method Not Allowed');

  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Token no proporcionado' });

  try {
    jwt.verify(token, process.env.JWT_SECRET!); // solo validar el token

    const ticketId = parseInt(req.query.id as string);
    if (isNaN(ticketId)) return res.status(400).json({ message: 'ID inválido' });

    await prisma.tickets.update({
      where: { id: ticketId },
      data: { needs_facture: false },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(400).json({
      message: 'Error actualizando el ticket',
      error: error instanceof Error ? error.message : 'Error desconocido',
    });
  }
}
