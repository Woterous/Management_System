import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createCourse } from '../service/courseService';

/**
 * 新建课程页面 (NewCoursePage.jsx)
 * 采用现代 iOS 风格美化，提供沉浸式表单体验，保留原始业务逻辑。
 */
export default function NewCoursePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    location: '',
    totalPlannedSessions: 0,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (key) => (e) => {
    const value = key === 'totalPlannedSessions' ? Number(e.target.value) : e.target.value;
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createCourse({
        title: form.title,
        location: form.location,
        totalPlannedSessions: Number(form.totalPlannedSessions) || 0,
      });
      navigate('/courses');
    } catch (err) {
      setError(err.response?.data?.error || '创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFF] pb-12 font-sans text-slate-800 antialiased">
      {/* 顶部页眉 - 磨砂玻璃效果 */}
      <div className="bg-white/70 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-100 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            to="/courses" 
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">新建课程</h2>
            <p className="text-slate-400 text-[11px] font-medium uppercase tracking-wider mt-0.5">Create New Course</p>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto p-6 mt-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 表单卡片 */}
          <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm space-y-6">
            
            {/* 课程名称 */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                课程名称 <span className="text-rose-400">*</span>
              </label>
              <div className="relative group">
                <input 
                  value={form.title} 
                  onChange={handleChange('title')} 
                  required 
                  placeholder="请输入课程名称（如：高等数学）" 
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-semibold placeholder:text-slate-300 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                />
              </div>
            </div>

            {/* 上课地点 */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                上课地点
              </label>
              <div className="relative">
                <input 
                  value={form.location} 
                  onChange={handleChange('location')} 
                  placeholder="例：教学楼 A302 或 线上授课" 
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-semibold placeholder:text-slate-300 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                />
              </div>
            </div>

            {/* 计划总课次 */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                计划总课次 <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input 
                  type="number"
                  min="0"
                  value={form.totalPlannedSessions} 
                  onChange={handleChange('totalPlannedSessions')} 
                  required 
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-semibold placeholder:text-slate-300 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
                />
                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">
                  Sessions
                </div>
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center text-white shrink-0">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-rose-600 text-xs font-bold">{error}</p>
              </div>
            )}
          </div>

          {/* 提交按钮 */}
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-[2rem] text-sm font-black tracking-wide transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2
              ${loading 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-indigo-200 hover:shadow-indigo-300/50'
              }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-500 rounded-full animate-spin"></div>
                正在保存...
              </>
            ) : (
              <>
                创建课程
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}