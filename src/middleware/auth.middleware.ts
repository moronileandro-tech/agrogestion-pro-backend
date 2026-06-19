import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cambiar-en-produccion';

// Extiende el tipo Request para incluir el usuario autenticado
export interface AuthRequest extends Request {
  usuario?: {
    id: string;
    rol: string;
    establecimientoId: string;
  };
}

// Verifica que el request tenga un token JWT válido.
// Se usa en cada ruta protegida: router.get('/', verificarToken, controller)
export function verificarToken(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no provisto' });
  }

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthRequest['usuario'];
    req.usuario = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// Restringe una ruta a ciertos roles.
// Ejemplo: router.post('/', verificarToken, permitirRoles('ADMIN','GERENTE'), controller)
export function permitirRoles(...rolesPermitidos: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ error: 'No tenés permiso para esta acción' });
    }
    next();
  };
}
