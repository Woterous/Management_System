import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStudent } from '../service/studentService';

export default function NewStudentPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    studentNo: '',
    age: '',
    note: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createStudent({
        name: form.name,
        studentNo: form.studentNo || undefined,
        age: form.age ? Number(form.age) : undefined,
        note: form.note || undefined,
      });
      navigate(-1);
    } catch (err) {
      setError(err.response?.data?.error || err.message || '创建学生失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-12 font-sans antialiased">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-100 px-6 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-slate-50 rounded-full transition-all"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-black text-slate-900">新建学生</h1>
          <button 
            onClick={() => navigate('/students')} 
            className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            学生列表
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 mt-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
            {/* 姓名输入 */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                姓名 <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input 
                  value={form.name} 
                  onChange={handleChange('name')} 
                  required 
                  placeholder="请输入学生真实姓名" 
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-6 text-sm font-medium text-slate-900 focus:ring-4 focus:ring-indigo-50 transition-all outline-none placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* 学号输入 */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                学号 (可选)
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                </div>
                <input 
                  value={form.studentNo} 
                  onChange={handleChange('studentNo')} 
                  placeholder="请输入学号" 
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-6 text-sm font-medium text-slate-900 focus:ring-4 focus:ring-indigo-50 transition-all outline-none placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* 年龄输入 */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                年龄 (可选)
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-300 group-focus-within:text-indigo-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <input 
                  type="number" 
                  min="0" 
                  value={form.age} 
                  onChange={handleChange('age')} 
                  placeholder="请输入学生年龄" 
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-6 text-sm font-medium text-slate-900 focus:ring-4 focus:ring-indigo-50 transition-all outline-none placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* 备注输入 */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                备注 (可选)
              </label>
              <textarea 
                value={form.note} 
                onChange={handleChange('note')} 
                placeholder="添加关于学生的额外信息..." 
                rows={4} 
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-medium text-slate-900 focus:ring-4 focus:ring-indigo-50 transition-all outline-none placeholder:text-slate-300 resize-none"
              />
            </div>
          </div>

          {/* 错误信息展示 */}
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-6 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-bold leading-tight">{error}</span>
            </div>
          )}

          {/* 提交按钮 */}
          <button 
            type="submit" 
            disabled={loading} 
            className={`w-full py-5 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${
              loading 
              ? 'bg-slate-400 text-white cursor-not-allowed' 
              : 'bg-slate-900 text-white hover:bg-black'
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                创建中...
              </>
            ) : (
              '确认并创建学生'
            )}
          </button>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-in-from-top-2 { from { transform: translateY(-8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-in { animation-duration: 400ms; animation-fill-mode: forwards; }
        .fade-in { animation-name: fade-in; }
        .slide-in-from-top-2 { animation-name: slide-in-from-top-2; }
      `}} />
    </div>
  );
}
