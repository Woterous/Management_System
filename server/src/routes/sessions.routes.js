import { Router } from 'express';
import { authGuard } from '../middleware/auth.middleware.js';
import {
  listSessions,
  getSession,
  openSession,
  updateAttendance,
  closeSession,
} from '../controllers/sessions.controller.js';

export const sessionsRouter = Router();

sessionsRouter.use(authGuard);

// /api/sessions?from&to (week view)
sessionsRouter.get('/', listSessions);
// /api/sessions/:sessionId detail (includes attendance)
sessionsRouter.get('/:sessionId', getSession);
// /api/sessions/:sessionId/open
sessionsRouter.post('/:sessionId/open', openSession);
// /api/sessions/:sessionId/attendance
sessionsRouter.patch('/:sessionId/attendance', updateAttendance);
// /api/sessions/:sessionId/close
sessionsRouter.post('/:sessionId/close', closeSession);
