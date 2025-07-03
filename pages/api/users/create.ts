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
  const { username, password, name, role } = req.body;

  // Validar que todos los campos requeridos estén presentes
  if (!username || !password || !name || !role ) {
    return res.status(400).json({ message: 'Faltan campos requeridos' });
  }

  // ❌ Regla 1: No se puede crear usuarios con rol "super"
  if (role === 'super') {
    return res.status(403).json({ message: 'No está permitido crear usuarios con rol super' });
  }

  // ❌ Regla 2: Los empleados no pueden crear usuarios
  if (currentUser.role === 'employee') {
    return res.status(403).json({ message: 'No tienes permisos para crear usuarios' });
  }

  

  try {
    // Encriptar contraseña antes de guardar
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario en la base de datos
    const newUser = await prisma.users.create({
      data: {
        username,
        password: hashedPassword,
        name,
        role,
        office_id: currentUser.officeId, // Asignar la oficina del usuario autenticado
      },
      // Solo devolver campos seguros
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        office_id: true,
      },
    });

    // Respuesta exitosa con los datos del nuevo usuario
    return res.status(201).json(newUser);

  } catch (error: any) {
    // Error por username duplicado (P2002)
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'El nombre de usuario ya existe' });
    }

    // Error inesperado
    console.error(error);
    return res.status(500).json({ message: 'Error al crear usuario' });
  }
}
