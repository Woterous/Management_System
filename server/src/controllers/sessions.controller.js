import {
  listSessionsForTeacherRange,
  getSessionDetailForTeacher,
  openSessionForTeacher,
  updateAttendanceForTeacher,
  closeSessionForTeacher,
} from '../services/session.service.js';

export async function listSessions(req, res, next) {
  try {
    const sessions = await listSessionsForTeacherRange(req.teacher.id, req.query);
    res.json(sessions);
  } catch (err) {
    next(err);
  }
}

export async function getSession(req, res, next) {
  try {
    const data = await getSessionDetailForTeacher(req.teacher.id, req.params.sessionId);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

export async function openSession(req, res, next) {
  try {
    const result = await openSessionForTeacher(req.teacher.id, req.params.sessionId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateAttendance(req, res, next) {
  try {
    const result = await updateAttendanceForTeacher(
      req.teacher.id,
      req.params.sessionId,
      req.body
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function closeSession(req, res, next) {
  try {
    const result = await closeSessionForTeacher(req.teacher.id, req.params.sessionId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
