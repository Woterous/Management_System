// TODO: init Express app, middlewares, routes, error handling\n
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db/pool.js';
import { authRouter } from './routes/auth.routes.js';
import { coursesRouter } from './routes/courses.routes.js';
import { studentsRouter } from './routes/students.routes.js';
import { sessionsRouter } from './routes/sessions.routes.js';
import { attendanceRouter } from './routes/attendance.routes.js';
import { statsRouter } from './routes/stats.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

dotenv.config();

// DB connectivity check on boot
pool.query('select 1').then(() => {
  console.log('DB connected');
}).catch(err => {
  console.error('DB connection error', err);
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || true,
  credentials: true,
}));

app.use(express.json());

console.log('NODE_ENV=', process.env.NODE_ENV);
console.log('PORT=', PORT);
console.log('Has DATABASE_URL=', !!process.env.DATABASE_URL);
console.log('Has JWT_SECRET=', !!process.env.JWT_SECRET);

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

// API routes
app.use('/api/auth', authRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/students', studentsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/stats', statsRouter);

// Root ping
app.get('/', (req, res) => res.send('API is running'));

// Centralized error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
