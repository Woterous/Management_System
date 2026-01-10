import { pool } from '../db/pool.js';

export async function courseBelongsToTeacher(courseId, teacherId) {
  const { rows } = await pool.query(
    `SELECT 1 FROM courses WHERE id = $1 AND teacher_id = $2`,
    [courseId, teacherId]
  );
  return !!rows[0];
}

export async function studentBelongsToTeacher(studentId, teacherId) {
  const { rows } = await pool.query(
    `SELECT 1 FROM students WHERE id = $1 AND teacher_id = $2`,
    [studentId, teacherId]
  );
  return !!rows[0];
}

export async function isStudentInCourse(studentId, courseId) {
  const { rows } = await pool.query(
    `SELECT 1 FROM course_students WHERE student_id = $1 AND course_id = $2`,
    [studentId, courseId]
  );
  return !!rows[0];
}
