-- Schema initialization for 教师签到管理系统
-- Tables: teachers, courses, students, course_students, sessions, attendance_records

-- Enable uuid generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name VARCHAR(80) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  title VARCHAR(120) NOT NULL,
  location VARCHAR(120),
  total_planned_sessions INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_courses_teacher ON courses(teacher_id);
CREATE INDEX IF NOT EXISTS idx_courses_teacher_title ON courses(teacher_id, title);

CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  student_no VARCHAR(64),
  name VARCHAR(80) NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uniq_teacher_student_no UNIQUE (teacher_id, student_no)
);
CREATE INDEX IF NOT EXISTS idx_students_teacher ON students(teacher_id);

CREATE TABLE IF NOT EXISTS course_students (
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (course_id, student_id)
);
CREATE INDEX IF NOT EXISTS idx_course_students_student ON course_students(student_id);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  location VARCHAR(120),
  status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_session_status CHECK (status IN ('scheduled', 'open', 'closed')),
  CONSTRAINT uq_course_starts_at UNIQUE (course_id, starts_at)
);
CREATE INDEX IF NOT EXISTS idx_sessions_course_starts ON sessions(course_id, starts_at);
CREATE INDEX IF NOT EXISTS idx_sessions_starts ON sessions(starts_at);

CREATE TABLE IF NOT EXISTS attendance_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL,
  note TEXT,
  marked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_attendance_status CHECK (status IN ('present', 'late', 'leave', 'absent')),
  CONSTRAINT uq_session_student UNIQUE (session_id, student_id)
);
CREATE INDEX IF NOT EXISTS idx_attendance_session ON attendance_records(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance_records(status);

