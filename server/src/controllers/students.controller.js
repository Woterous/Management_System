import {
  createStudentForTeacher,
  listStudentsForTeacher,
  getStudentDetail,
} from '../services/student.service.js';

export async function createStudent(req, res, next) {
  try {
    const student = await createStudentForTeacher(req.teacher.id, req.body);
    res.status(201).json(student);
  } catch (err) {
    next(err);
  }
}

export async function listStudents(req, res, next) {
  try {
    const students = await listStudentsForTeacher(req.teacher.id, req.query.q);
    res.json(students);
  } catch (err) {
    next(err);
  }
}

export async function getStudent(req, res, next) {
  try {
    const student = await getStudentDetail(req.teacher.id, req.params.studentId);
    res.json(student);
  } catch (err) {
    next(err);
  }
}
