import { Router } from 'express';
import { authGuard } from '../middleware/auth.middleware.js';
import {
  createCourse,
  listCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  addStudentToCourse,
  listCourseStudents,
  removeStudentFromCourse,
  createCourseSession,
  listCourseSessions,
} from '../controllers/courses.controller.js';

export const coursesRouter = Router();

coursesRouter.use(authGuard);

// Courses CRUD
coursesRouter.post('/', createCourse);
coursesRouter.get('/', listCourses);
coursesRouter.get('/:courseId', getCourse);
coursesRouter.patch('/:courseId', updateCourse);
coursesRouter.delete('/:courseId', deleteCourse);

// Course roster
coursesRouter.post('/:courseId/students', addStudentToCourse);
coursesRouter.get('/:courseId/students', listCourseStudents);
coursesRouter.delete('/:courseId/students/:studentId', removeStudentFromCourse);

// Course sessions (per-course)
coursesRouter.post('/:courseId/sessions', createCourseSession);
coursesRouter.get('/:courseId/sessions', listCourseSessions);
