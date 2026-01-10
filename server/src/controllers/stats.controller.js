import { getCourseStats, getStudentCourseStats } from '../services/stats.service.js';

export async function courseStats(req, res, next) {
  try {
    const result = await getCourseStats(req.teacher.id, req.params.courseId);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function studentCourseStats(req, res, next) {
  try {
    const result = await getStudentCourseStats(
      req.teacher.id,
      req.params.courseId,
      req.params.studentId
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}
