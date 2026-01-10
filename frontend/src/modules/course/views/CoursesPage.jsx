import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listCourses } from '../service/courseService';

/**
 * 课程列表页面 (CoursesPage.jsx)
 * 采用现代 iOS 风格美化，保留原始业务逻辑与接口。
 */
export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    listCourses()
      .then((data) => {
        if (mounted) setCourses(data);
      })
      .catch((err) => {
        if (mounted) setError(err.response?.data?.error || '加载失败');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFDFF] pb-12 font-sans text-slate-800 antialiased">
      {/* 顶部页眉 - 磨砂玻璃效果 */}
      <div className="bg-white/70 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-100 px-6 py-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">课程管理</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-slate-400 text-[11px] font-medium uppercase tracking-wider">Course Catalog</p>
          </div>
        </div>
        <Link 
          to="/courses/new"
          className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-sm font-bold shadow-sm hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          新建课程
        </Link>
      </div>

      <div className="max-w-2xl mx-auto p-4 mt-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm font-medium animate-pulse">获取课程列表中...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl text-center">
            <p className="text-rose-500 text-sm font-bold">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-rose-600 text-xs underline font-bold"
            >
              刷新重试
            </button>
          </div>
        ) : courses.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-100 rounded-[2rem] shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-slate-400 font-medium text-sm">暂无课程，去新建一个吧</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {courses.map((c) => (
              <Link 
                key={c.id} 
                to={`/courses/${c.id}`}
                className="bg-white border border-slate-100 p-5 rounded-[2rem] shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2-2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-600 transition-colors">
                      {c.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {c.location || '未填写地点'}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                      <span className="text-slate-400 text-xs font-medium">
                        计划 {c.total_planned_sessions || 0} 课次
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-50 p-2 rounded-xl group-hover:bg-emerald-50 transition-colors">
                  <svg className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}