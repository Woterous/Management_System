import { registerTeacher, loginTeacher, getProfile } from '../services/auth.service.js';

export async function register(req, res, next) {
  try {
    const result = await registerTeacher(req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const result = await loginTeacher(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const result = await getProfile(req.teacher.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
