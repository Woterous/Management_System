import { useState } from 'react';
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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
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
          onClick={() => setShowLogoutConfirm(true)}
        >
          <span className="bottom-nav-icon">🚪</span>
          <span className="bottom-nav-label">退出</span>
        </button>
      </nav>

      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(15,23,42,0.45)' }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-[320px] p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h3 className="text-lg font-bold text-slate-900 mb-2">确认退出？</h3>
            <p className="text-sm text-slate-500 mb-6">退出后需要重新登录才能继续使用。</p>
            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-all"
                onClick={() => setShowLogoutConfirm(false)}
              >
                取消
              </button>
              <button
                type="button"
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 text-white font-bold shadow-lg hover:opacity-90 transition-all active:scale-95"
                onClick={() => {
                  clearToken();
                  window.location.href = '/login';
                }}
              >
                确认退出
              </button>
            </div>
          </div>
        </div>
      )}
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
