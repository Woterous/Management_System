import { http } from '../../../shared/api/http';

export async function listCourses(q) {
  const res = await http.get('/courses', { params: q ? { q } : undefined });
  return res.data;
}

export async function createCourse(payload) {
  const res = await http.post('/courses', payload);
  return res.data;
}

export async function getCourse(courseId) {
  const res = await http.get(`/courses/${courseId}`);
  return res.data;
}

export async function listCourseStudents(courseId) {
  const res = await http.get(`/courses/${courseId}/students`);
  return res.data;
}

export async function listCourseSessions(courseId) {
  const res = await http.get(`/courses/${courseId}/sessions`);
  return res.data;
}

export async function addStudentToCourse(courseId, studentId) {
  const res = await http.post(`/courses/${courseId}/students`, { studentId });
  return res.data;
}

export async function removeStudentFromCourse(courseId, studentId) {
  const res = await http.delete(`/courses/${courseId}/students/${studentId}`);
  return res.data;
}
