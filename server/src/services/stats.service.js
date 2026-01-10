import { pool } from '../db/pool.js';
import { courseBelongsToTeacher } from '../repositories/course_student.repository.js';

export async function getCourseStats(teacherId, courseId) {
  const ownsCourse = await courseBelongsToTeacher(courseId, teacherId);
  if (!ownsCourse) {
    const err = new Error('Course not found');
    err.status = 404;
    throw err;
  }

  const courseInfo = await pool.query(
    `SELECT total_planned_sessions FROM courses WHERE id = $1`,
    [courseId]
  );
  const totalPlannedSessions = courseInfo.rows[0]?.total_planned_sessions || 0;

  const { rows } = await pool.query(
    `SELECT s.id as student_id,
            s.name,
            s.student_no,
            COALESCE(SUM((ar.status = 'present')::int),0) as present,
            COALESCE(SUM((ar.status = 'late')::int),0) as late,
            COALESCE(SUM((ar.status = 'leave')::int),0) as leave,
            COALESCE(SUM((ar.status = 'absent')::int),0) as absent
     FROM students s
     JOIN course_students cs ON cs.student_id = s.id AND cs.course_id = $1
     LEFT JOIN attendance_records ar ON ar.student_id = s.id
       AND ar.session_id IN (SELECT id FROM sessions WHERE course_id = $1)
     GROUP BY s.id, s.name, s.student_no
     ORDER BY s.name`,
    [courseId]
  );

  const sessionsCountResult = await pool.query(
    `SELECT COUNT(*)::int as count
     FROM sessions
     WHERE course_id = $1`,
    [courseId]
  );

  return {
    totalPlannedSessions,
    sessionsCount: sessionsCountResult.rows[0].count,
    students: rows.map((r) => ({
      studentId: r.student_id,
      name: r.name,
      studentNo: r.student_no,
      present: Number(r.present),
      late: Number(r.late),
      leave: Number(r.leave),
      absent: Number(r.absent),
    })),
  };
}

export async function getStudentCourseStats(teacherId, courseId, studentId) {
  const ownsCourse = await courseBelongsToTeacher(courseId, teacherId);
  if (!ownsCourse) {
    const err = new Error('Course not found');
    err.status = 404;
    throw err;
  }

  const { rows } = await pool.query(
    `SELECT ar.*, s.starts_at, s.ends_at
     FROM attendance_records ar
     JOIN sessions s ON s.id = ar.session_id
     WHERE s.course_id = $1 AND ar.student_id = $2
     ORDER BY s.starts_at`,
    [courseId, studentId]
  );

  const summary = rows.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    },
    { present: 0, late: 0, leave: 0, absent: 0 }
  );

  return {
    summary,
    records: rows.map((r) => ({
      sessionId: r.session_id,
      status: r.status,
      note: r.note,
      startsAt: r.starts_at,
      endsAt: r.ends_at,
    })),
  };
}
