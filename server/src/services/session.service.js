import { z } from 'zod';
import {
  createSession,
  listSessionsByCourse,
  listSessionsByRange,
  getSessionWithCourse,
  updateSessionStatus,
} from '../repositories/session.repository.js';
import { courseBelongsToTeacher } from '../repositories/course_student.repository.js';
import { initAttendanceForCourseStudents, listAttendanceWithStudents, updateAttendanceBatch } from '../repositories/attendance.repository.js';

const sessionCreateSchema = z.object({
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  location: z.string().optional(),
});

const sessionQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

const attendanceUpdateSchema = z.object({
  records: z.array(
    z.object({
      studentId: z.string().uuid(),
      status: z.enum(['present', 'late', 'leave', 'absent']),
      note: z.string().optional().nullable(),
    })
  ),
});

export async function createSessionForCourse(teacherId, courseId, payload) {
  const body = sessionCreateSchema.parse(payload);
  const ownsCourse = await courseBelongsToTeacher(courseId, teacherId);
  if (!ownsCourse) {
    const err = new Error('Course not found');
    err.status = 404;
    throw err;
  }
  try {
    return await createSession({
      courseId,
      startsAt: body.startsAt,
      endsAt: body.endsAt,
      location: body.location,
    });
  } catch (err) {
    // unique constraint on course_id + starts_at -> conflict
    if (err.code === '23505') {
      err.status = 409;
      err.message = 'Session time conflicts (duplicate starts_at for course)';
    }
    throw err;
  }
}

export async function listCourseSessionsForTeacher(teacherId, courseId, query) {
  const params = sessionQuerySchema.parse(query);
  const ownsCourse = await courseBelongsToTeacher(courseId, teacherId);
  if (!ownsCourse) {
    const err = new Error('Course not found');
    err.status = 404;
    throw err;
  }
  return await listSessionsByCourse(courseId, params);
}

export async function listSessionsForTeacherRange(teacherId, query) {
  const params = sessionQuerySchema.parse(query);
  return await listSessionsByRange(teacherId, params);
}

export async function getSessionDetailForTeacher(teacherId, sessionId) {
  const session = await getSessionWithCourse(sessionId);
  if (!session || session.teacher_id !== teacherId) {
    const err = new Error('Session not found');
    err.status = 404;
    throw err;
  }
  const attendance = await listAttendanceWithStudents(sessionId);
  return { session, attendance };
}

export async function openSessionForTeacher(teacherId, sessionId) {
  const session = await getSessionWithCourse(sessionId);
  if (!session || session.teacher_id !== teacherId) {
    const err = new Error('Session not found');
    err.status = 404;
    throw err;
  }
  await initAttendanceForCourseStudents(sessionId, session.course_id, 'present');
  await updateSessionStatus(sessionId, 'open');
  return { ok: true };
}

export async function updateAttendanceForTeacher(teacherId, sessionId, payload) {
  const data = attendanceUpdateSchema.parse(payload);
  const session = await getSessionWithCourse(sessionId);
  if (!session || session.teacher_id !== teacherId) {
    const err = new Error('Session not found');
    err.status = 404;
    throw err;
  }
  await updateAttendanceBatch(sessionId, data.records);
  return { ok: true };
}

export async function closeSessionForTeacher(teacherId, sessionId) {
  const session = await getSessionWithCourse(sessionId);
  if (!session || session.teacher_id !== teacherId) {
    const err = new Error('Session not found');
    err.status = 404;
    throw err;
  }
  await updateSessionStatus(sessionId, 'closed');
  return { ok: true };
}
