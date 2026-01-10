import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { listCourses } from '../../course/service/courseService';
import { getStudentCourseStats } from '../../stats/service/statsService';

// --- 辅助函数 ---
function groupByDate(records) {
  const map = new Map();
  records.forEach((r) => {
    const dateKey = new Date(r.startsAt).toISOString().slice(0, 10);
    map.set(dateKey, r);
  });
  return map;
}

function buildMonthDays(year, month) {
  const days = [];
  const date = new Date(Date.UTC(year, month, 1));
  while (date.getUTCMonth() === month) {
    days.push(new Date(date));
    date.setUTCDate(date.getUTCDate() + 1);
  }
  return days;
}

const statusConfig = {
  present: { label: '出勤', color: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  late: { label: '迟到', color: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
  leave: { label: '请假', color: '#0ea5e9', bg: 'bg-sky-50', text: 'text-sky-600', dot: 'bg-sky-500' },
  absent: { label: '缺勤', color: '#f43f5e', bg: 'bg-rose-50', text: 'text-rose-600', dot: 'bg-rose-500' },
};

// --- iOS 风格滚轮组件 ---
const AppleWheelPicker = ({ value, options, onChange, label }) => {
  const containerRef = useRef(null);
  const itemRefs = useRef({});

  useEffect(() => {
    const el = itemRefs.current[value];
    const container = containerRef.current;
    if (el && container) {
      const top = el.offsetTop - container.clientHeight / 2 + el.clientHeight / 2;
      container.scrollTo({ top, behavior: 'smooth' });
    }
  }, [value]);

  return (
    <div className="flex flex-col items-center flex-1">
      <span className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-tighter">{label}</span>
      <div className="relative h-28 w-full max-w-[80px]">
        <div className="absolute top-1/2 left-0 w-full h-8 -translate-y-1/2 bg-blue-50/50 border-y border-blue-100 rounded-lg pointer-events-none" />
        <div
          ref={containerRef}
          className="relative h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar z-10"
        >
          <div className="py-10">
            {options.map((opt) => (
              <div
                key={opt.value}
                ref={(node) => (itemRefs.current[opt.value] = node)}
                onClick={() => onChange(opt.value)}
                className={`h-8 flex items-center justify-center snap-center cursor-pointer transition-all duration-300 ${
                  value === opt.value ? 'text-blue-600 font-bold text-base scale-110' : 'text-slate-300 text-xs scale-90'
                }`}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function StudentStatsPage() {
  const { studentId } = useParams();
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    listCourses()
      .then((res) => {
        setCourses(res);
        if (res[0]) setCourseId(res[0].id);
      })
      .catch((err) => setError(err.response?.data?.error || '加载课程失败'));
  }, []);

  useEffect(() => {
    if (!courseId || !studentId) return;
    setLoading(true);
    getStudentCourseStats(courseId, studentId)
      .then((res) => {
        setSummary(res.summary || {});
        setRecords(res.records || []);
      })
      .catch((err) => setError(err.response?.data?.error || '加载统计失败'))
      .finally(() => setLoading(false));
  }, [courseId, studentId]);

  const monthDays = buildMonthDays(selectedYear, selectedMonth - 1);
  const recordMap = groupByDate(records);

  const years = Array.from({ length: 5 }, (_, i) => ({ value: 2023 + i, label: `${2023 + i}` }));
  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `${i + 1}月` }));

  return (
    <div className="min-h-screen bg-[#FDFDFF] pb-12 font-sans text-slate-800 antialiased">
      {/* 顶部页眉 */}
      <div className="bg-white/70 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-100 px-6 py-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">学生出勤统计</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-slate-400 text-[11px] font-medium uppercase tracking-wider">Attendance Insights</p>
          </div>
        </div>
        <button 
          className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all active:scale-90 shadow-sm border border-slate-100" 
          onClick={() => window.history.back()}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        
        {/* 筛选器卡片 */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-3">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">选择课程</label>
            <div className="relative">
              <select 
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pr-10 text-sm font-semibold text-slate-700 outline-none appearance-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                value={courseId} 
                onChange={(e) => setCourseId(e.target.value)}
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex bg-slate-50/80 rounded-2xl px-4 py-2 border border-slate-100 gap-2 min-w-[180px]">
            <AppleWheelPicker label="年份" options={years} value={selectedYear} onChange={setSelectedYear} />
            <div className="w-px h-10 bg-slate-200 self-center opacity-50" />
            <AppleWheelPicker label="月份" options={months} value={selectedMonth} onChange={setSelectedMonth} />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm font-medium animate-pulse">正在同步云端统计...</p>
          </div>
        ) : (
          <>
            {/* 统计概览 - 仪表盘风格 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(statusConfig).map(([key, config]) => (
                <div key={key} className="bg-white border border-slate-100 p-4 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">{config.label}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900">{summary?.[key] || 0}</span>
                    <span className="text-[10px] text-slate-300 font-bold uppercase">次</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 日历部分 */}
            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm border border-slate-100">
              <div className="grid grid-cols-7 gap-2">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(w => (
                  <div key={w} className="text-center text-[9px] font-black text-slate-300 pb-4 tracking-tighter">{w}</div>
                ))}
                {monthDays.map((d) => {
                  const key = d.toISOString().slice(0, 10);
                  const rec = recordMap.get(key);
                  const status = rec?.status;
                  const config = status ? statusConfig[status] : null;

                  return (
                    <div
                      key={key}
                      className={`relative group flex flex-col items-center justify-center aspect-[4/5] rounded-2xl transition-all duration-500 ${
                        status 
                        ? 'bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100 scale-100' 
                        : 'bg-slate-50/30'
                      }`}
                    >
                      <span className={`text-xs font-bold ${status ? 'text-slate-900' : 'text-slate-300'}`}>
                        {d.getUTCDate()}
                      </span>
                      
                      {status && (
                        <div className={`mt-1.5 px-2 py-0.5 rounded-full ${config.bg} ${config.text} text-[9px] font-black scale-90`}>
                          {config.label}
                        </div>
                      )}

                      {rec?.note && (
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                          <span className="w-1 h-1 bg-white rounded-full"></span>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-slate-900 text-white text-[10px] p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-50">
                            {rec.note}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}} />
    </div>
  );
}
