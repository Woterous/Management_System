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
  const navItems = [
    { to: '/', label: '课表', icon: '📅' },
    { to: '/courses', label: '课程', icon: '📚' },
    { to: '/students', label: '学生', icon: '👥' },
  ];

  return (
    <div className="app-shell">
      <main className="app-main">
        <Outlet />
      </main>
      <nav className="bottom-nav">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => (isActive ? 'bottom-nav-item active' : 'bottom-nav-item')}>
            <span className="bottom-nav-icon">{item.icon}</span>
            <span className="bottom-nav-label">{item.label}</span>
          </NavLink>
        ))}
        <button
          type="button"
          className="bottom-nav-item"
          onClick={() => {
            clearToken();
            window.location.href = '/login';
          }}
        >
          <span className="bottom-nav-icon">🚪</span>
          <span className="bottom-nav-label">退出</span>
        </button>
      </nav>
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
