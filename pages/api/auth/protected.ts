import type { NextApiRequest, NextApiResponse } from 'next';
import { getUserFromRequest } from '../../../lib/auth';	

// Ruta protegida que responde solo si el usuario está autenticado
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = getUserFromRequest(req);

  // Verificación de autenticación
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Respuesta personalizada si está autenticado
  return res.status(200).json({ message: `Bienvenido ${user.username}, rol: ${user.role}` });
}
