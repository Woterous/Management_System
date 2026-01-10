import { Routes, Route, Navigate, Outlet, NavLink } from 'react-router-dom';
import LoginPage from '../modules/auth/views/LoginPage';
import WeekSchedulePage from '../modules/session/views/WeekSchedulePage';
import NewSessionPage from '../modules/session/views/NewSessionPage';
import CoursesPage from '../modules/course/views/CoursesPage';
import CourseDetailPage from '../modules/course/views/CourseDetailPage';
import NewCoursePage from '../modules/course/views/NewCoursePage';
import CheckinPage from '../modules/attendance/views/CheckinPage';
import NewStudentPage from '../modules/student/views/NewStudentPage';
import StudentsPage from '../modules/student/views/StudentsPage';
import StudentStatsPage from '../modules/student/views/StudentStatsPage';
import { getToken, clearToken } from '../shared/api/auth';

function RequireAuth() {
  const token = getToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <h2 style={{ marginTop: 0 }}>签到管理</h2>
        <nav>
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : undefined)}>
            本周课表
          </NavLink>
          <NavLink to="/courses" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            课程列表
          </NavLink>
          <NavLink to="/courses/new" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            新建课程
          </NavLink>
          <NavLink to="/students" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            学生列表
          </NavLink>
          <NavLink to="/students/new" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            新建学生
          </NavLink>
          <button
            className="button secondary"
            style={{ marginTop: 16, width: '100%' }}
            onClick={() => {
              clearToken();
              window.location.href = '/login';
            }}
          >
            退出
          </button>
        </nav>
      </aside>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<WeekSchedulePage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/new" element={<NewCoursePage />} />
          <Route path="/courses/:courseId/sessions/new" element={<NewSessionPage />} />
          <Route path="/courses/:courseId" element={<CourseDetailPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/students/new" element={<NewStudentPage />} />
          <Route path="/students/:studentId/stats" element={<StudentStatsPage />} />
          <Route path="/sessions/:sessionId/checkin" element={<CheckinPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
