import { Router } from 'express';
import { authGuard } from '../middleware/auth.middleware.js';
import {
  createStudent,
  listStudents,
  getStudent,
} from '../controllers/students.controller.js';

export const studentsRouter = Router();

studentsRouter.use(authGuard);

studentsRouter.post('/', createStudent);
studentsRouter.get('/', listStudents);
studentsRouter.get('/:studentId', getStudent);
