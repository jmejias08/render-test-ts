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

  const { id, name, price, description} = req.body;

  if (!id || !name || !price || !description) {
    return res.status(400).json({ message: 'Faltan datos' });
  }

  try {
    const existingProduct = await prisma.products.findUnique({ where: { id } });

    if (!existingProduct) return res.status(404).json({ message: 'Producto no encontrado' });

    // Solo se pueden editar productos de su misma oficina
    if (
      existingProduct.office_id !== currentUser.officeId
    ) {
      return res.status(403).json({ message: 'No puedes editar de otra sucursal' });
    }

    const updated = await prisma.products.update({
      where: { id },
      data: { name, price, description },
    });

    return res.status(200).json(updated);
    
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}
