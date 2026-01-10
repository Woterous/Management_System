import { z } from 'zod';
import {
  createStudent,
  listStudents,
  getStudentById,
} from '../repositories/student.repository.js';

const createSchema = z.object({
  name: z.string().min(1),
  studentNo: z.string().optional(),
  note: z.string().optional(),
  age: z.number().int().nonnegative().optional(),
});

export async function createStudentForTeacher(teacherId, payload) {
  const data = createSchema.parse(payload);
  return await createStudent({
    teacherId,
    name: data.name,
    studentNo: data.studentNo,
    note: data.note,
    age: data.age,
  });
}

export async function listStudentsForTeacher(teacherId, q) {
  return await listStudents({ teacherId, q });
}

export async function getStudentDetail(teacherId, studentId) {
  const student = await getStudentById(studentId);
  if (!student || student.teacher_id !== teacherId) {
    const err = new Error('Student not found');
    err.status = 404;
    throw err;
  }
  return student;
}
