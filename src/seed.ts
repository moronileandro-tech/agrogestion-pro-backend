import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Este script crea los datos iniciales para poder entrar al sistema
// por primera vez: el establecimiento "Estancia La Criolla" y un usuario admin.
// Se ejecuta una sola vez con: npm run seed
async function main() {
  const establecimiento = await prisma.establecimiento.upsert({
    where: { id: 'la-criolla-seed' },
    update: {},
    create: {
      id: 'la-criolla-seed',
      nombre: 'Estancia La Criolla',
      ubicacion: '25 de Mayo, Buenos Aires',
      hectareasTotales: 8000,
    },
  });

  const passwordHash = await bcrypt.hash('campo2025', 10);

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@lacriolla.com.ar' },
    update: {},
    create: {
      nombre: 'Administrador',
      email: 'admin@lacriolla.com.ar',
      passwordHash,
      rol: 'ADMIN',
      establecimientoId: establecimiento.id,
    },
  });

  console.log('Establecimiento creado:', establecimiento.nombre);
  console.log('Usuario admin creado:', admin.email, '(contraseña: campo2025)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
