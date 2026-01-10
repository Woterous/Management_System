import { pool } from '../db/pool.js';

export async function createSession({ courseId, startsAt, endsAt, location }) {
  const { rows } = await pool.query(
    `INSERT INTO sessions (course_id, starts_at, ends_at, location)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [courseId, startsAt, endsAt, location || null]
  );
  return rows[0];
}

export async function listSessionsByCourse(courseId, { from, to }) {
  const params = [courseId];
  let where = 'course_id = $1';
  if (from) {
    params.push(from);
    where += ` AND starts_at >= $${params.length}`;
  }
  if (to) {
    params.push(to);
    where += ` AND starts_at <= $${params.length}`;
  }
  const { rows } = await pool.query(
    `SELECT * FROM sessions
     WHERE ${where}
     ORDER BY starts_at DESC`,
    params
  );
  return rows;
}

export async function listSessionsByRange(teacherId, { from, to }) {
  const params = [teacherId];
  let where = 'c.teacher_id = $1';
  if (from) {
    params.push(from);
    where += ` AND s.starts_at >= $${params.length}`;
  }
  if (to) {
    params.push(to);
    where += ` AND s.starts_at <= $${params.length}`;
  }
  const { rows } = await pool.query(
    `SELECT s.*, c.title as course_title, COALESCE(s.location, c.location) as location, c.id as course_id
     FROM sessions s
     JOIN courses c ON c.id = s.course_id
     WHERE ${where}
     ORDER BY s.starts_at ASC`,
    params
  );
  return rows;
}

export async function getSessionWithCourse(sessionId) {
  const { rows } = await pool.query(
    `SELECT s.*, c.teacher_id, c.title as course_title, COALESCE(s.location, c.location) as location, c.id as course_id
     FROM sessions s
     JOIN courses c ON c.id = s.course_id
     WHERE s.id = $1
     LIMIT 1`,
    [sessionId]
  );
  return rows[0];
}

export async function updateSessionStatus(sessionId, status) {
  const { rows } = await pool.query(
    `UPDATE sessions
     SET status = $2
     WHERE id = $1
     RETURNING *`,
    [sessionId, status]
  );
  return rows[0];
}

