import { PrismaClient } from '@prisma/client';

// Una sola instancia de Prisma para toda la app (evita agotar conexiones a la DB)
export const prisma = new PrismaClient();
