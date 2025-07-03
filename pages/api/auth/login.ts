// Importaciones necesarias para tipado, hashing, JWT y manejo de cookies
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { PrismaClient } from '@prisma/client';

// Instancia única del cliente de Prisma
const prisma = new PrismaClient();

// Endpoint para manejo de inicio de sesión
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Solo se permite método POST
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const { username, password } = req.body;

  // Validación de campos obligatorios
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  // Buscar el usuario en la base de datos por nombre de usuario
  const user = await prisma.users.findUnique({ where: { username } });

  // Validar que el usuario exista y que la contraseña sea correcta
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Cargar datos seguros en el token JWT
  const payload = {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    officeId: user.office_id,
  };

  // Firmar el token con la clave secreta y expiración de 12 horas
  const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '12h' });

  // Configurar la cookie con el token: segura, HttpOnly y con SameSite
  const cookie = serialize('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 12, // 12 horas
    path: '/',
  });

  // Enviar la cookie al cliente
  res.setHeader('Set-Cookie', cookie);
  return res.status(200).json({ message: 'Login successful' });
}
