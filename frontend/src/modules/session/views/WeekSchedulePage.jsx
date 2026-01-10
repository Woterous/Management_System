import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listWeekSessions } from '../service/sessionService';

/**
 * 获取本周的时间范围 (ISO 格式)
 * 实际项目使用的文件，保留了原始接口引用。
 */
function getWeekRangeISO() {
  const now = new Date();
  const day = now.getDay() || 7; 
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day - 1));
  monday.setHours(0, 0, 0, 0);
  const nextMonday = new Date(monday);
  nextMonday.setDate(monday.getDate() + 7);
  return {
    from: monday.toISOString(),
    to: nextMonday.toISOString(),
  };
}

export default function WeekSchedulePage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const { from, to } = getWeekRangeISO();
    listWeekSessions(from, to)
      .then((data) => setSessions(data))
      .catch((err) => setError(err.response?.data?.error || '加载失败'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFDFF] pb-12 font-sans text-slate-800 antialiased">
      <div className="bg-white/70 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-100 px-6 py-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">本周课表</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <p className="text-slate-400 text-[11px] font-medium uppercase tracking-wider">Weekly Schedule</p>
          </div>
        </div>
        <Link 
          to="/courses"
          className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-sm font-bold shadow-sm hover:bg-slate-800 transition-all active:scale-95 flex items-center gap-2"
        >
          课程列表
        </Link>
      </div>

      <div className="max-w-2xl mx-auto p-4 mt-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm font-medium animate-pulse">正在加载课表...</p>
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl text-center">
            <p className="text-rose-500 text-sm font-bold">{error}</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-100 rounded-[2rem] shadow-sm">
            <p className="text-slate-400 font-medium text-sm">本周暂无排课计划</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((s) => (
              <div key={s.id} className="bg-white border border-slate-100 p-5 rounded-[2rem] shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{s.course_title || s.title}</h3>
                      <p className="text-slate-400 text-[11px] font-bold uppercase mt-0.5">{s.location || '未填写地点'}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <Link to={`/sessions/${s.id}/checkin`} className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 py-3 rounded-2xl text-sm font-extrabold hover:bg-indigo-600 hover:text-white transition-all">
                    进入签到
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}