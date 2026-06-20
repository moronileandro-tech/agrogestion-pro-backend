

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './modules/auth/auth.routes';
import { ganaderiaRouter } from './modules/ganaderia/ganaderia.routes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rutas de la API, organizadas por módulo de negocio.
// A medida que construyamos Agricultura, Riego, etc., se agregan acá igual.
app.use('/api/auth', authRouter);
app.use('/api/ganaderia', ganaderiaRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Ruta temporal para crear el usuario admin inicial desde el navegador,
// sin necesitar acceso a una terminal. Se borra después del primer uso.
app.get('/api/setup-inicial', async (_req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const { prisma } = require('./lib/prisma-client');

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

    res.json({
      mensaje: 'Usuario creado correctamente. Ya podés borrar esta ruta.',
      email: admin.email,
      password: 'campo2025',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`AgroGestión Pro API corriendo en puerto ${PORT}`);
});
