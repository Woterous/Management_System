import { http } from '../../../shared/api/http';

export async function getCourseStats(courseId) {
  const res = await http.get(`/stats/courses/${courseId}`);
  return res.data;
}

export async function getStudentCourseStats(courseId, studentId) {
  const res = await http.get(`/stats/courses/${courseId}/students/${studentId}`);
  return res.data;
}
