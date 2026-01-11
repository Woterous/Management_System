import { useState } from 'react';
import { Routes, Route, Navigate, Outlet, NavLink, useLocation } from 'react-router-dom';
import { Calendar, BookOpen, Users, LogOut } from 'lucide-react'; // 推荐安装 lucide-react
import { motion, AnimatePresence } from 'framer-motion';

// ... 保持原有导入不变 (LoginPage, WeekSchedulePage 等)
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
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function AppLayout() {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const location = useLocation();
  
  const navItems = [
    { to: '/', label: '课表', icon: <Calendar size={20} /> },
    { to: '/courses', label: '课程', icon: <BookOpen size={20} /> },
    { to: '/students', label: '学生', icon: <Users size={20} /> },
  ];
  const showNav = ['/', '/courses', '/students'].includes(location.pathname);

  return (
    <div className="relative min-h-screen bg-slate-50/50">
      <main className="pb-20">
        <Outlet />
      </main>

      {/* 紧凑型垂直布局导航栏：仅一级页面显示，带向下滑出的动画 */}
      <AnimatePresence>
        {showNav && (
          <div className="fixed inset-x-0 bottom-5 z-50 flex justify-center">
            <motion.nav
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 250, damping: 22 }}
              className="px-2 py-1.5 bg-white/85 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.08)] rounded-[2.5rem] flex items-center gap-1"
            >
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => `
                    relative flex flex-col items-center justify-center min-w-[70px] py-2 rounded-[2rem] transition-all duration-300 group
                    ${isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}
                  `}
                >
                  {({ isActive }) => (
                    <>
                      {/* 选中的胶囊背景 */}
                      {isActive && (
                        <motion.div
                          layoutId="nav-pill"
                          className="absolute inset-0 bg-indigo-50/80 rounded-[1.8rem] -z-10"
                          transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                        />
                      )}
                      
                      {/* 图标：保持在上方，间距极小 */}
                      <span className={`transition-all duration-300 ${isActive ? 'scale-110 -translate-y-0.5' : 'opacity-80'}`}>
                        {item.icon}
                      </span>

                      {/* 文字：紧贴图标下方 */}
                      <span className={`text-[11px] font-bold tracking-tighter mt-0.5 transition-all ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                        {item.label}
                      </span>
                    </>
                  )}
                </NavLink>
              ))}

              {/* 极细分割线 */}
              <div className="w-[1px] h-6 bg-slate-100 mx-1" />

              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="flex flex-col items-center justify-center min-w-[70px] py-2 text-slate-400 hover:text-rose-500 transition-colors group"
              >
                <LogOut size={20} className="group-active:translate-x-0.5 transition-transform" />
                <span className="text-[11px] font-bold tracking-tighter mt-0.5">退出</span>
              </button>
            </motion.nav>
          </div>
        )}
      </AnimatePresence>

      {/* 退出确认弹窗 */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-[320px] p-8 overflow-hidden"
            >
              {/* 装饰图标 */}
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 text-center mb-2">确认要离开吗？</h3>
              <p className="text-slate-500 text-center text-sm mb-8 leading-relaxed">记得保存您的工作，退出后需要重新验证身份。</p>
              
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold shadow-lg shadow-slate-200 active:scale-95 transition-all"
                  onClick={() => {
                    clearToken();
                    window.location.href = '/login';
                  }}
                >
                  确认退出
                </button>
                <button
                  type="button"
                  className="w-full py-4 rounded-2xl bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 transition-all"
                  onClick={() => setShowLogoutConfirm(false)}
                >
                  我再想想
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<WeekSchedulePage />} />

          {/* 课程 */}
          <Route path="courses" element={<CoursesPage />} />
          <Route path="courses/new" element={<NewCoursePage />} />
          <Route path="courses/:courseId" element={<CourseDetailPage />} />
          <Route path="courses/:courseId/sessions/new" element={<NewSessionPage />} />

          {/* 学生 */}
          <Route path="students" element={<StudentsPage />} />
          <Route path="students/new" element={<NewStudentPage />} />
          <Route path="students/:studentId/stats" element={<StudentStatsPage />} />

          {/* 签到 */}
          <Route path="sessions/:sessionId/checkin" element={<CheckinPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
