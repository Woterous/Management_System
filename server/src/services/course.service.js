import { z } from 'zod';
import {
  createCourse,
  listCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from '../repositories/course.repository.js';
import {
  addStudentToCourse,
  listCourseStudents,
  removeStudentFromCourse,
} from '../repositories/student.repository.js';
import {
  courseBelongsToTeacher,
  studentBelongsToTeacher,
  isStudentInCourse,
} from '../repositories/course_student.repository.js';

const courseSchema = z.object({
  title: z.string().min(1),
  location: z.string().optional(),
  totalPlannedSessions: z.number().int().nonnegative(),
});

const courseUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  location: z.string().optional(),
  totalPlannedSessions: z.number().int().nonnegative().optional(),
});

const addStudentSchema = z.object({
  studentId: z.string().uuid(),
});

export async function createCourseForTeacher(teacherId, payload) {
  const data = courseSchema.parse(payload);
  return await createCourse({
    teacherId,
    title: data.title,
    location: data.location,
    totalPlannedSessions: data.totalPlannedSessions,
  });
}

export async function listCoursesForTeacher(teacherId, q) {
  return await listCourses({ teacherId, q });
}

export async function getCourseDetail(teacherId, courseId) {
  const course = await getCourseById(courseId);
  if (!course || course.teacher_id !== teacherId) {
    const err = new Error('Course not found');
    err.status = 404;
    throw err;
  }
  return course;
}

export async function updateCourseForTeacher(teacherId, courseId, payload) {
  const data = courseUpdateSchema.parse(payload);
  const course = await getCourseById(courseId);
  if (!course || course.teacher_id !== teacherId) {
    const err = new Error('Course not found');
    err.status = 404;
    throw err;
  }
  return await updateCourse(courseId, {
    title: data.title,
    location: data.location,
    totalPlannedSessions: data.totalPlannedSessions,
  });
}

export async function deleteCourseForTeacher(teacherId, courseId) {
  const course = await getCourseById(courseId);
  if (!course || course.teacher_id !== teacherId) {
    const err = new Error('Course not found');
    err.status = 404;
    throw err;
  }
  await deleteCourse(courseId);
  return { ok: true };
}

export async function addStudentToCourseForTeacher(teacherId, courseId, payload) {
  const { studentId } = addStudentSchema.parse(payload);

  const ownsCourse = await courseBelongsToTeacher(courseId, teacherId);
  if (!ownsCourse) {
    const err = new Error('Course not found');
    err.status = 404;
    throw err;
  }
  const ownsStudent = await studentBelongsToTeacher(studentId, teacherId);
  if (!ownsStudent) {
    const err = new Error('Student not found');
    err.status = 404;
    throw err;
  }

  await addStudentToCourse(courseId, studentId);
  return { ok: true };
}

export async function listCourseStudentsForTeacher(teacherId, courseId) {
  const ownsCourse = await courseBelongsToTeacher(courseId, teacherId);
  if (!ownsCourse) {
    const err = new Error('Course not found');
    err.status = 404;
    throw err;
  }
  return await listCourseStudents(courseId);
}

export async function removeStudentFromCourseForTeacher(teacherId, courseId, studentId) {
  const ownsCourse = await courseBelongsToTeacher(courseId, teacherId);
  if (!ownsCourse) {
    const err = new Error('Course not found');
    err.status = 404;
    throw err;
  }
  const inCourse = await isStudentInCourse(studentId, courseId);
  if (!inCourse) {
    const err = new Error('Student not in course');
    err.status = 404;
    throw err;
  }
  await removeStudentFromCourse(courseId, studentId);
  return { ok: true };
}
