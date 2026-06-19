import { prisma } from '../../lib/prisma-client';
import { CategoriaAnimal, EstadoAnimal } from '@prisma/client';

interface FiltrosAnimal {
  categoria?: CategoriaAnimal;
  busqueda?: string;
}

// Lista animales del establecimiento, con filtros opcionales.
// Siempre se filtra por establecimientoId: nunca un cliente ve datos de otro.
export async function listarAnimales(establecimientoId: string, filtros: FiltrosAnimal) {
  return prisma.animal.findMany({
    where: {
      establecimientoId,
      estado: EstadoAnimal.ACTIVO,
      ...(filtros.categoria ? { categoria: filtros.categoria } : {}),
      ...(filtros.busqueda
        ? {
            OR: [
              { caravanaInterna: { contains: filtros.busqueda, mode: 'insensitive' } },
              { caravanaSenasa: { contains: filtros.busqueda, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: {
      potreroActual: true,
      pesadas: { orderBy: { fecha: 'desc' }, take: 1 }, // último peso registrado
    },
    orderBy: { caravanaInterna: 'asc' },
  });
}

// Ficha completa de un animal: datos + historial sanitario + reproductivo + pesadas
export async function obtenerFichaAnimal(establecimientoId: string, animalId: string) {
  const animal = await prisma.animal.findFirst({
    where: { id: animalId, establecimientoId },
    include: {
      potreroActual: true,
      madre: { select: { caravanaInterna: true } },
      pesadas: { orderBy: { fecha: 'desc' } },
      eventosSanitarios: { orderBy: { fecha: 'desc' } },
      eventosReproductivos: { orderBy: { fecha: 'desc' } },
    },
  });

  if (!animal) {
    throw new Error('Animal no encontrado');
  }
  return animal;
}

interface NuevoAnimalInput {
  caravanaInterna: string;
  caravanaSenasa?: string;
  categoria: CategoriaAnimal;
  fechaIngreso: Date;
  procedencia: string;
  potreroActualId?: string;
  pesoIngresoKg?: number;
}

// Crea un animal nuevo y, si viene peso de ingreso, registra la primera pesada
export async function crearAnimal(establecimientoId: string, input: NuevoAnimalInput) {
  return prisma.$transaction(async (tx) => {
    const animal = await tx.animal.create({
      data: {
        establecimientoId,
        caravanaInterna: input.caravanaInterna,
        caravanaSenasa: input.caravanaSenasa,
        categoria: input.categoria,
        fechaIngreso: input.fechaIngreso,
        procedencia: input.procedencia,
        potreroActualId: input.potreroActualId,
      },
    });

    if (input.pesoIngresoKg) {
      await tx.pesada.create({
        data: {
          animalId: animal.id,
          pesoKg: input.pesoIngresoKg,
          fecha: input.fechaIngreso,
          observacion: 'Peso de ingreso',
        },
      });
    }

    return animal;
  });
}

// Estadísticas para las tarjetas del dashboard del módulo
export async function obtenerEstadisticasRodeo(establecimientoId: string) {
  const [total, vacasCria, terneros, invernada, toros] = await Promise.all([
    prisma.animal.count({ where: { establecimientoId, estado: EstadoAnimal.ACTIVO } }),
    prisma.animal.count({ where: { establecimientoId, estado: EstadoAnimal.ACTIVO, categoria: CategoriaAnimal.VACA_CRIA } }),
    prisma.animal.count({
      where: {
        establecimientoId,
        estado: EstadoAnimal.ACTIVO,
        categoria: { in: [CategoriaAnimal.TERNERO, CategoriaAnimal.TERNERA] },
      },
    }),
    prisma.animal.count({
      where: {
        establecimientoId,
        estado: EstadoAnimal.ACTIVO,
        categoria: { in: [CategoriaAnimal.NOVILLO, CategoriaAnimal.VAQUILLONA] },
      },
    }),
    prisma.animal.count({ where: { establecimientoId, estado: EstadoAnimal.ACTIVO, categoria: CategoriaAnimal.TORO } }),
  ]);

  return { total, vacasCria, terneros, invernada, toros };
}

// Registra un evento sanitario, individual o masivo por rodeo
export async function registrarEventoSanitario(data: {
  animalId?: string;
  tipo: string;
  producto: string;
  dosis?: string;
  fecha: Date;
  proximaFecha?: Date;
  cantidadAnimales?: number;
  rodeoAfectado?: string;
  responsableId?: string;
  costo?: number;
}) {
  return prisma.eventoSanitario.create({ data: data as any });
}
