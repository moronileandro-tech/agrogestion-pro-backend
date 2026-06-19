import { Router, Response } from 'express';
import { AuthRequest, verificarToken, permitirRoles } from '../../middleware/auth.middleware';
import * as ganaderiaService from './ganaderia.service';

export const ganaderiaRouter = Router();

// Todas las rutas de ganadería requieren estar autenticado
ganaderiaRouter.use(verificarToken);

// GET /api/ganaderia/animales?categoria=NOVILLO&busqueda=AR-12
ganaderiaRouter.get('/animales', async (req: AuthRequest, res: Response) => {
  const { categoria, busqueda } = req.query;
  try {
    const animales = await ganaderiaService.listarAnimales(req.usuario!.establecimientoId, {
      categoria: categoria as any,
      busqueda: busqueda as string,
    });
    res.json(animales);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar animales' });
  }
});

// GET /api/ganaderia/animales/:id  → ficha completa
ganaderiaRouter.get('/animales/:id', async (req: AuthRequest, res: Response) => {
  try {
    const ficha = await ganaderiaService.obtenerFichaAnimal(req.usuario!.establecimientoId, req.params.id);
    res.json(ficha);
  } catch (error) {
    res.status(404).json({ error: 'Animal no encontrado' });
  }
});

// POST /api/ganaderia/animales  → alta de animal nuevo
// Restringido: un contratista no puede dar de alta animales
ganaderiaRouter.post(
  '/animales',
  permitirRoles('ADMIN', 'GERENTE', 'CAPATAZ'),
  async (req: AuthRequest, res: Response) => {
    try {
      const animal = await ganaderiaService.crearAnimal(req.usuario!.establecimientoId, {
        ...req.body,
        fechaIngreso: new Date(req.body.fechaIngreso),
      });
      res.status(201).json(animal);
    } catch (error) {
      res.status(400).json({ error: 'No se pudo crear el animal' });
    }
  }
);

// GET /api/ganaderia/estadisticas  → tarjetas resumen del módulo
ganaderiaRouter.get('/estadisticas', async (req: AuthRequest, res: Response) => {
  try {
    const stats = await ganaderiaService.obtenerEstadisticasRodeo(req.usuario!.establecimientoId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// POST /api/ganaderia/eventos-sanitarios → registrar vacunación, tratamiento, etc
ganaderiaRouter.post(
  '/eventos-sanitarios',
  permitirRoles('ADMIN', 'GERENTE', 'CAPATAZ'),
  async (req: AuthRequest, res: Response) => {
    try {
      const evento = await ganaderiaService.registrarEventoSanitario({
        ...req.body,
        fecha: new Date(req.body.fecha),
        proximaFecha: req.body.proximaFecha ? new Date(req.body.proximaFecha) : undefined,
        responsableId: req.usuario!.id,
      });
      res.status(201).json(evento);
    } catch (error) {
      res.status(400).json({ error: 'No se pudo registrar el evento' });
    }
  }
);
