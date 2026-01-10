import { Router } from 'express';
import { authGuard } from '../middleware/auth.middleware.js';
import { courseStats, studentCourseStats } from '../controllers/stats.controller.js';

export const statsRouter = Router();

statsRouter.use(authGuard);

// /api/stats/courses/:courseId
statsRouter.get('/courses/:courseId', courseStats);
// /api/stats/courses/:courseId/students/:studentId
statsRouter.get('/courses/:courseId/students/:studentId', studentCourseStats);
