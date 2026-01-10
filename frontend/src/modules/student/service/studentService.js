import { http } from '../../../shared/api/http';

export async function listStudents(q) {
  const res = await http.get('/students', { params: q ? { q } : undefined });
  return res.data;
}

export async function createStudent(payload) {
  const res = await http.post('/students', payload);
  return res.data;
}

export async function getStudent(studentId) {
  const res = await http.get(`/students/${studentId}`);
  return res.data;
}
