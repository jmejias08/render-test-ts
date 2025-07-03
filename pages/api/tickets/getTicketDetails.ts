import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';


const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).end('Method Not Allowed');

    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Token no proporcionado' });


    const ticketId = req.query.id;

    if (!ticketId || typeof ticketId !== 'string') {
        return res.status(400).json({ message: 'ID de ticket no proporcionado o inválido' });
    }

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET!) as {
            id: number;
            role: 'super' | 'admin' | 'employee';
            officeId: number;
        };

        const ticketIdParameter = parseInt(ticketId, 10);




        const ticket_details = await prisma.$queryRaw`
             SELECT 
                ticket_id, product_id, product_name, quantity,
                price, subtotal, discount, taxes, total,
                taxes_percentage ,discount_percentage, 
                description, exonerated
            FROM vw_summary_ticket_details
            WHERE office_id = ${user.officeId} and ticket_id = ${ticketIdParameter}
        `;




        return res.status(200).json(ticket_details);
    } catch (err) {
        return res.status(400).json({ message: 'Error de servidor', error: err instanceof Error ? err.message : 'Error desconocido' });
    }
}
