import { pool } from '../db/pool.js';

export async function initAttendanceForCourseStudents(sessionId, courseId, defaultStatus = 'present') {
  await pool.query(
    `INSERT INTO attendance_records (session_id, student_id, status)
     SELECT $1, cs.student_id, $3
     FROM course_students cs
     WHERE cs.course_id = $2
     ON CONFLICT (session_id, student_id) DO NOTHING`,
    [sessionId, courseId, defaultStatus]
  );
}

export async function listAttendanceWithStudents(sessionId) {
  const { rows } = await pool.query(
    `SELECT ar.*, s.name, s.student_no
     FROM attendance_records ar
     JOIN students s ON s.id = ar.student_id
     WHERE ar.session_id = $1
     ORDER BY s.name ASC`,
    [sessionId]
  );
  return rows;
}

export async function updateAttendanceBatch(sessionId, records) {
  const queries = records.map((r) =>
    pool.query(
      `UPDATE attendance_records
       SET status = $3, note = $4, marked_at = now()
       WHERE session_id = $1 AND student_id = $2`,
      [sessionId, r.studentId, r.status, r.note || null]
    )
  );
  await Promise.all(queries);
}
