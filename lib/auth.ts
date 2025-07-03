// Importa la librería jsonwebtoken para verificar tokens JWT
import jwt from 'jsonwebtoken';
// Importa el tipo para solicitudes HTTP en la API de Next.js
import { NextApiRequest } from 'next';

/**
 * Extrae y valida el token JWT desde las cookies de una solicitud API.
 *
 * @param req - Objeto de solicitud HTTP de Next.js
 * @returns Un objeto con los datos decodificados del token si es válido,
 *          o `null` si no hay token o la verificación falla.
 */
export function getUserFromRequest(req: NextApiRequest) {
  // Extrae el token desde la cookie 'token'
  const token = req.cookies.token;

  // Si no hay token, el usuario no está autenticado
  if (!token) return null;

  try {
    // Verifica y decodifica el token usando la clave secreta definida en .env
    return jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      username: string;
      role: string;
      officeId: number;
    };
  } catch {
    // Si el token es inválido o ha expirado, retorna null
    return null;
  }
}
