// Importaciones necesarias
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';


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
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }

  // Extraer datos del cuerpo de la solicitud
  const { id_card, name, phone, email, address } = req.body;



  // Validar que todos los campos requeridos estén presentes
  if (!id_card || !name || !phone || !email || !address) {
    return res.status(400).json({ message: 'Faltan campos requeridos' });
  }


  

  try {

    // Crear cliente usuario en la base de datos
    const newClient = await prisma.clients.create({
      data: {
        id_card,
        name,
        phone,
        email,
        address,
        office_id: currentUser.officeId, // Asignar la oficina del usuario autenticado
      },
      // Solo devolver campos seguros
      select: {
        id: true,
        id_card: true,
        name: true,
        phone: true,
        email: true,
        address: true,
        office_id: true, // Incluir la oficina del cliente
      },
    });

    // Respuesta exitosa con los datos del nuevo cliente
    return res.status(201).json(newClient);

  } catch (error: any) {
    // Error por username duplicado (P2002)
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'El nombre de usuario ya existe' });
    }

    // Error inesperado
    console.error(error);
    return res.status(500).json({ message: 'Error al crear cliente' });
  }
}
