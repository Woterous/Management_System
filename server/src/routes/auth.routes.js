import { Router } from 'express';
import {
  register,
  login,
  me,
} from '../controllers/auth.controller.js';
import { authGuard } from '../middleware/auth.middleware.js';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/me', authGuard, me);
