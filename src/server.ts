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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`AgroGestión Pro API corriendo en puerto ${PORT}`);
});
