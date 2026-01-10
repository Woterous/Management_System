import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listStudents } from '../service/studentService';

/**
 * 实际项目使用的文件 (StudentsPage.jsx)
 * 注意：此文件包含真实的接口引用，直接在预览环境运行会报错。
 * 请将其内容复制到你的本地 IDE 项目中使用。
 */
export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const load = (keyword) => {
    setLoading(true);
    listStudents(keyword)
      .then((res) => setStudents(res))
      .catch((err) => setError(err.response?.data?.error || '加载失败'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFDFF] pb-12 font-sans text-slate-800 antialiased">
      {/* 顶部页眉 - 磨砂玻璃效果 */}
      <div className="bg-white/70 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-100 px-6 py-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">学生管理</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <p className="text-slate-400 text-[11px] font-medium uppercase tracking-wider">Student Directory</p>
          </div>
        </div>
        <Link 
          to="/students/new"
          className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-sm font-bold shadow-sm hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          新建学生
        </Link>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* 搜索区域 */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
            <svg className="w-5 h-5 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="w-full bg-white border border-slate-100 rounded-[1.5rem] py-4 pl-12 pr-4 text-sm font-medium shadow-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-400 outline-none transition-all placeholder:text-slate-300"
            value={q}
            onChange={(e) => {
              const val = e.target.value;
              setQ(val);
              load(val);
            }}
            placeholder="搜索姓名或学号..."
          />
        </div>

        {/* 列表区域 */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-slate-400 text-sm font-medium animate-pulse">正在检索档案...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl text-center">
              <p className="text-rose-500 text-sm font-bold">{error}</p>
              <button onClick={() => load(q)} className="mt-2 text-rose-600 text-xs underline font-bold">重试</button>
            </div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-100 rounded-[2rem] shadow-sm">
              <p className="text-slate-400 font-medium text-sm">暂无符合条件的学生</p>
            </div>
          ) : (
            students.map((s) => (
              <div 
                key={s.id} 
                className="bg-white border border-slate-100 p-5 rounded-[2rem] shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 font-black text-lg shadow-inner">
                    {s.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 flex items-center gap-2 text-base">
                      {s.name}
                      {s.student_no && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded-md font-mono font-medium border border-slate-200/50">
                          #{s.student_no}
                        </span>
                      )}
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5 font-medium">
                      {s.age != null ? `年龄 ${s.age} 岁` : '年龄未录入'}
                    </p>
                  </div>
                </div>
                
                <Link 
                  to={`/students/${s.id}/stats`}
                  className="flex items-center gap-1.5 bg-slate-50 text-slate-600 px-4 py-2 rounded-xl text-xs font-extrabold hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
                >
                  出勤统计
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}