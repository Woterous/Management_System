import { pool } from '../db/pool.js';

export async function createStudent({ teacherId, name, studentNo, note, age }) {
  const { rows } = await pool.query(
    `INSERT INTO students (teacher_id, name, student_no, note, age)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [teacherId, name, studentNo || null, note || null, age ?? null]
  );
  return rows[0];
}

export async function listStudents({ teacherId, q }) {
  if (q) {
    const { rows } = await pool.query(
      `SELECT * FROM students
       WHERE teacher_id = $1 AND (name ILIKE $2 OR student_no ILIKE $2)
       ORDER BY created_at DESC`,
      [teacherId, `%${q}%`]
    );
    return rows;
  }
  const { rows } = await pool.query(
    `SELECT * FROM students
     WHERE teacher_id = $1
     ORDER BY created_at DESC`,
    [teacherId]
  );
  return rows;
}

export async function getStudentById(studentId) {
  const { rows } = await pool.query(
    `SELECT * FROM students WHERE id = $1 LIMIT 1`,
    [studentId]
  );
  return rows[0];
}

export async function addStudentToCourse(courseId, studentId) {
  const { rows } = await pool.query(
    `INSERT INTO course_students (course_id, student_id)
     VALUES ($1, $2)
     ON CONFLICT DO NOTHING
     RETURNING *`,
    [courseId, studentId]
  );
  return rows[0];
}

export async function removeStudentFromCourse(courseId, studentId) {
  await pool.query(
    `DELETE FROM course_students WHERE course_id = $1 AND student_id = $2`,
    [courseId, studentId]
  );
}

export async function listCourseStudents(courseId) {
  const { rows } = await pool.query(
    `SELECT s.*
     FROM course_students cs
     JOIN students s ON s.id = cs.student_id
     WHERE cs.course_id = $1
     ORDER BY s.name ASC`,
    [courseId]
  );
  return rows;
}
