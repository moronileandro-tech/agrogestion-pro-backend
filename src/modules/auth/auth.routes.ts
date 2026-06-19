import { Router, Request, Response } from 'express';
import { login } from './auth.service';

export const authRouter = Router();

authRouter.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
  }

  try {
    const resultado = await login(email, password);
    res.json(resultado);
  } catch (error) {
    res.status(401).json({ error: 'Credenciales inválidas' });
  }
});
