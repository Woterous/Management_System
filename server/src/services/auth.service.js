import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { findTeacherByEmail, findTeacherById, createTeacher } from '../repositories/teacher.repository.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function registerTeacher(payload) {
  const { email, password, name } = registerSchema.parse(payload);

  const existing = await findTeacherByEmail(email);
  if (existing) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const teacher = await createTeacher({ email, passwordHash, name });
  const token = signToken(teacher);

  return { token, teacher: sanitizeTeacher(teacher) };
}

export async function loginTeacher(payload) {
  const { email, password } = loginSchema.parse(payload);

  const teacher = await findTeacherByEmail(email);
  if (!teacher) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const ok = await bcrypt.compare(password, teacher.password_hash);
  if (!ok) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const token = signToken(teacher);
  return { token, teacher: sanitizeTeacher(teacher) };
}

export async function getProfile(teacherId) {
  const teacher = await findTeacherById(teacherId);
  if (!teacher) {
    const err = new Error('Teacher not found');
    err.status = 404;
    throw err;
  }
  return sanitizeTeacher(teacher);
}

function signToken(teacher) {
  return jwt.sign(
    { teacherId: teacher.id, email: teacher.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function sanitizeTeacher(teacher) {
  return { id: teacher.id, email: teacher.email, name: teacher.name };
}
