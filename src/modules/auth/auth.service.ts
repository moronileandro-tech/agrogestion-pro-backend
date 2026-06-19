import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma-client';

const JWT_SECRET = process.env.JWT_SECRET || 'cambiar-en-produccion';

export async function login(email: string, password: string) {
  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario || !usuario.activo) {
    throw new Error('Credenciales inválidas');
  }

  const passwordOk = await bcrypt.compare(password, usuario.passwordHash);
  if (!passwordOk) {
    throw new Error('Credenciales inválidas');
  }

  const token = jwt.sign(
    { id: usuario.id, rol: usuario.rol, establecimientoId: usuario.establecimientoId },
    JWT_SECRET,
    { expiresIn: '12h' } // turno típico de trabajo de campo
  );

  return {
    token,
    usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
  };
}
