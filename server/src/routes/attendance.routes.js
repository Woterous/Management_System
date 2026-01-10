import { Router } from 'express';
import { authGuard } from '../middleware/auth.middleware.js';

export const attendanceRouter = Router();

// Placeholder, attendance endpoints are handled under /api/sessions/:sessionId/*
attendanceRouter.use(authGuard);
