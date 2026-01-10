import { pool } from '../db/pool.js';

export async function createCourse({ teacherId, title, location, totalPlannedSessions }) {
  const { rows } = await pool.query(
    `INSERT INTO courses (teacher_id, title, location, total_planned_sessions)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [teacherId, title, location || null, totalPlannedSessions]
  );
  return rows[0];
}

export async function listCourses({ teacherId, q }) {
  if (q) {
    const { rows } = await pool.query(
      `SELECT * FROM courses
       WHERE teacher_id = $1 AND title ILIKE $2
       ORDER BY created_at DESC`,
      [teacherId, `%${q}%`]
    );
    return rows;
  }
  const { rows } = await pool.query(
    `SELECT * FROM courses
     WHERE teacher_id = $1
     ORDER BY created_at DESC`,
    [teacherId]
  );
  return rows;
}

export async function getCourseById(courseId) {
  const { rows } = await pool.query(
    `SELECT * FROM courses WHERE id = $1 LIMIT 1`,
    [courseId]
  );
  return rows[0];
}

export async function updateCourse(courseId, { title, location, totalPlannedSessions }) {
  const { rows } = await pool.query(
    `UPDATE courses
     SET title = COALESCE($2, title),
         location = COALESCE($3, location),
         total_planned_sessions = COALESCE($4, total_planned_sessions),
         updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [courseId, title, location, totalPlannedSessions]
  );
  return rows[0];
}

export async function deleteCourse(courseId) {
  await pool.query(`DELETE FROM courses WHERE id = $1`, [courseId]);
}
