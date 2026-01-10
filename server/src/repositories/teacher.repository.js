import { pool } from '../db/pool.js';

export async function findTeacherByEmail(email) {
  const { rows } = await pool.query(
    'SELECT * FROM teachers WHERE email = $1 LIMIT 1',
    [email]
  );
  return rows[0];
}

export async function findTeacherById(id) {
  const { rows } = await pool.query(
    'SELECT * FROM teachers WHERE id = $1 LIMIT 1',
    [id]
  );
  return rows[0];
}

export async function createTeacher({ email, passwordHash, name }) {
  const { rows } = await pool.query(
    `INSERT INTO teachers (email, password_hash, name)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [email, passwordHash, name]
  );
  return rows[0];
}
