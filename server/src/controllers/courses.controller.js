import {
  createCourseForTeacher,
  listCoursesForTeacher,
  getCourseDetail,
  updateCourseForTeacher,
  deleteCourseForTeacher,
  addStudentToCourseForTeacher,
  listCourseStudentsForTeacher,
  removeStudentFromCourseForTeacher,
} from '../services/course.service.js';
import { createSessionForCourse, listCourseSessionsForTeacher } from '../services/session.service.js';

export async function createCourse(req, res, next) {
  try {
    const course = await createCourseForTeacher(req.teacher.id, req.body);
    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
}

export async function listCourses(req, res, next) {
  try {
    const courses = await listCoursesForTeacher(req.teacher.id, req.query.q);
    res.json(courses);
  } catch (err) {
    next(err);
  }
}

export async function getCourse(req, res, next) {
  try {
    const course = await getCourseDetail(req.teacher.id, req.params.courseId);
    res.json(course);
  } catch (err) {
    next(err);
  }
}

export async function updateCourse(req, res, next) {
  try {
    const course = await updateCourseForTeacher(req.teacher.id, req.params.courseId, req.body);
    res.json(course);
  } catch (err) {
    next(err);
  }
}

export async function deleteCourse(req, res, next) {
  try {
    const result = await deleteCourseForTeacher(req.teacher.id, req.params.courseId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function addStudentToCourse(req, res, next) {
  try {
    const result = await addStudentToCourseForTeacher(req.teacher.id, req.params.courseId, req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function listCourseStudents(req, res, next) {
  try {
    const students = await listCourseStudentsForTeacher(req.teacher.id, req.params.courseId);
    res.json(students);
  } catch (err) {
    next(err);
  }
}

export async function removeStudentFromCourse(req, res, next) {
  try {
    const result = await removeStudentFromCourseForTeacher(
      req.teacher.id,
      req.params.courseId,
      req.params.studentId
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function createCourseSession(req, res, next) {
  try {
    const session = await createSessionForCourse(
      req.teacher.id,
      req.params.courseId,
      req.body
    );
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
}

export async function listCourseSessions(req, res, next) {
  try {
    const sessions = await listCourseSessionsForTeacher(
      req.teacher.id,
      req.params.courseId,
      req.query
    );
    res.json(sessions);
  } catch (err) {
    next(err);
  }
}
