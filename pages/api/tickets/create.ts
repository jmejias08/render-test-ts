import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'No autorizado: falta token' });

  let currentUser;
  try {
    currentUser = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      username: string;
      role: string;
      officeId: number;
    };
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }

  const {
    clientId,
    type,
    vehiclePlate,
    needsFacture,
    comment,
    products,
    pending_ticket_description,
    pending_ticket_exp_date
  } = req.body;

  console.log('Datos recibidos:', req.body);

  if (!clientId || !type || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ message: 'Datos incompletos o inválidos' });
  }

  const parsedClientId = Number(clientId);
  if (isNaN(parsedClientId)) {
    return res.status(400).json({ message: 'clientId inválido' });
  }

  if (type === 'credit' && (!pending_ticket_description || !pending_ticket_exp_date)) {
    return res.status(400).json({ message: 'Faltan datos para ticket de crédito' });
  }

  try {
    const productIds = products.map((p: any) => p.productId);
    const allProducts = await prisma.products.findMany({
      where: { id: { in: productIds } }
    });

    if (allProducts.length !== productIds.length) {
      const foundIds = allProducts.map(p => p.id);
      const missing = productIds.filter(id => !foundIds.includes(id));
      return res.status(404).json({ message: `Producto(s) no encontrado(s): ${missing.join(', ')}` });
    }

    const productMap = new Map(allProducts.map(p => [p.id, p]));

    // Insertar el ticket manualmente
    const [insertedTicket] = await prisma.$queryRawUnsafe<any[]>(`
      INSERT INTO tickets (
        office_id, user_id, client_id, type, vehicle_plate, comment,
        date, needs_facture, payment_status
      )
      VALUES (
        ${currentUser.officeId}, ${currentUser.id}, ${parsedClientId},
        '${type}', '${vehiclePlate}', '${comment}',
        NOW(), ${needsFacture}, ${false}
      )
      RETURNING id;
    `);

    const ticketId = insertedTicket.id;

    // Insertar cada detalle del ticket
    for (const item of products) {
      const product = productMap.get(item.productId);
      if (!product) continue;

      await prisma.$executeRawUnsafe(`
        INSERT INTO ticket_details (
          ticket_id, product_id, quantity, discount, price, taxes, exonerated
        )
        VALUES (
          ${ticketId}, ${product.id},
          ${item.quantity ?? 1}, ${item.discount ?? 0},
          ${product.price},
          ${item.taxes ?? 0},
          ${item.exonerated ?? false}
        );
      `);
    }

    // Si es crédito, registrar también en tabla de pendientes
    if (type === 'credit') {
      await prisma.$executeRawUnsafe(`
        INSERT INTO pending_pay_tickets (
          id_ticket, description, exp_date, state, total_to_pay, total_payed
        )
        VALUES (
          ${ticketId}, '${pending_ticket_description}',
          '${pending_ticket_exp_date}', 'pending', 0, 0
        );
      `);
    }

    return res.status(201).json({ id: ticketId, message: 'Ticket creado exitosamente' });
  } catch (error) {
    console.error('Error al crear ticket con queryRaw:', error);
    return res.status(500).json({ message: 'Error interno al crear el ticket (raw)' });
  }
}
