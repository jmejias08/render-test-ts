import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end('Method Not Allowed');

  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Token no proporcionado' });

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;
  const sortOrder = req.query.sort === 'asc' ? 'ASC' : 'DESC';

  const startDate = req.query.startDate as string | undefined;
  const endDate = req.query.endDate as string | undefined;
  const client = req.query.client as string | undefined;
  const seller = req.query.seller as string | undefined;
  const plate = req.query.plate as string | undefined;
  const pendingFacture = req.query.pendingFacture === 'true';


  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      role: 'super' | 'admin' | 'employee';
      officeId: number;
    };

    let whereConditions = `WHERE office_id = ${user.officeId}`;

    if (startDate) whereConditions += ` AND date >= '${startDate}'`;
    if (endDate) whereConditions += ` AND date <= '${endDate} 23:59:59'`;
    if (client) whereConditions += ` AND LOWER(client_name) LIKE LOWER('%${client}%')`;
    if (seller) whereConditions += ` AND LOWER(seller_name) LIKE LOWER('%${seller}%')`;
    if (plate) whereConditions += ` AND LOWER(vehicle_plate) LIKE LOWER('%${plate}%')`;
    if (pendingFacture) whereConditions += ` AND needs_facture = true`;

    const [tickets, count] = await Promise.all([
      prisma.$queryRawUnsafe(`
        SELECT id, client_name, seller_name, vehicle_plate, type,
                      needs_facture, payment_status, date, is_canceled,
                      subtotal, discount, taxes, total, comment
        FROM vw_ticket_summary
        ${whereConditions}
        ORDER BY date ${sortOrder}
        LIMIT ${limit} OFFSET ${offset}
      `),
      prisma.$queryRawUnsafe(`
        SELECT COUNT(*) as count
        FROM vw_ticket_summary
        ${whereConditions}
      `),
    ]);

    return res.status(200).json({ tickets, total: Number((count as any)[0].count) });
  } catch (err) {
    return res.status(400).json({ message: 'Error de servidor', error: err instanceof Error ? err.message : 'Error desconocido' });
  }
}
