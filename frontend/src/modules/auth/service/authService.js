import { http } from '../../../shared/api/http';
import { setToken, clearToken } from '../../../shared/api/auth';

export async function login(payload) {
  const res = await http.post('/auth/login', payload);
  const { token, teacher } = res.data;
  setToken(token);
  return teacher;
}

export async function register(payload) {
  const res = await http.post('/auth/register', payload);
  const { token, teacher } = res.data;
  setToken(token);
  return teacher;
}

export async function fetchMe() {
  try {
    const res = await http.get('/auth/me');
    return res.data;
  } catch (err) {
    clearToken();
    throw err;
  }
}
