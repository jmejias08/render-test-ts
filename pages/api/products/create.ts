// Importaciones necesarias
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Instancia única de Prisma
const prisma = new PrismaClient();

// Manejador principal del endpoint
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Solo permite método POST
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  // Extraer token JWT desde cookies
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'No autorizado: falta token' });
  }

  // Verificar token y extraer datos del usuario autenticado
  let currentUser;
  try {
    currentUser = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      username: string;
      role: 'super' | 'admin' | 'employee';
      officeId: number;
    };
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }

  // Extraer datos del cuerpo de la solicitud
  const { name, price, description} = req.body;

  // Validar que los campos requeridos estén presentes
  if (!name || !price) {
    return res.status(400).json({ message: 'Faltan campos requeridos' });
  }
  

  try {
    // Construir objeto de datos dinámicamente
    const productData: any = {
      name,
      price,
      office_id: currentUser.officeId,
    };

    if (description && description.trim() !== '') {
      productData.description = description;
    }

    // Crear producto en la base de datos
    const newProduct = await prisma.products.create({
      data: productData,
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
        office_id: true,
      },
    });



    // Respuesta exitosa
    return res.status(201).json(newProduct);

  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'El nombre de usuario ya existe' });
    }

    console.error(error);
    return res.status(500).json({ message: 'Error al crear producto' });
  }
}
