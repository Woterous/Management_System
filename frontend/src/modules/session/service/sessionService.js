import { http } from '../../../shared/api/http';

export async function listWeekSessions(from, to) {
  const res = await http.get('/sessions', { params: { from, to } });
  return res.data;
}

export async function getSessionDetail(sessionId) {
  const res = await http.get(`/sessions/${sessionId}`);
  return res.data;
}

export async function createSession(courseId, payload) {
  const res = await http.post(`/courses/${courseId}/sessions`, payload);
  return res.data;
}

export async function openSession(sessionId) {
  const res = await http.post(`/sessions/${sessionId}/open`);
  return res.data;
}

export async function closeSession(sessionId) {
  const res = await http.post(`/sessions/${sessionId}/close`);
  return res.data;
}

export async function saveAttendance(sessionId, records) {
  const res = await http.patch(`/sessions/${sessionId}/attendance`, { records });
  return res.data;
}
