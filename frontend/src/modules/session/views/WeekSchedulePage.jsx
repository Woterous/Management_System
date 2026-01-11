import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // 需安装 framer-motion
import { listWeekSessions } from '../service/sessionService';

// --- 辅助函数 ---
function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - (day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

const WEEK_DAYS = ['一', '二', '三', '四', '五', '六', '日'];
const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 08:00 - 22:00

export default function WeekSchedulePage() {
  const [baseDate, setBaseDate] = useState(getMonday(new Date()));
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(0); // 用于判断左右滑动方向

  // 计算当前周的 7 天日期
  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      return d;
    });
  }, [baseDate]);

  useEffect(() => {
    setLoading(true);
    const from = baseDate.toISOString();
    const to = new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    
    let alive = true;
    listWeekSessions(from, to)
      .then((data) => {
        if (!alive) return;
        // 后端字段是 snake_case，这里统一转换，避免 UI 取不到值
        const normalized = (data || []).map((s) => ({
          ...s,
          startsAt: s.starts_at || s.startsAt,
          endsAt: s.ends_at || s.endsAt,
          courseTitle: s.course_title || s.courseTitle || s.title,
          courseId: s.course_id || s.courseId,
        }));
        setSessions(normalized);
      })
      .catch((err) => {
        console.error('Week sessions load failed', err);
      })
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [baseDate]);

  const changeWeek = (delta) => {
    setDirection(delta);
    const newDate = new Date(baseDate);
    newDate.setDate(baseDate.getDate() + delta * 7);
    setBaseDate(newDate);
  };

  // 核心渲染逻辑：计算课程卡片在网格中的位置
  const renderSessionCard = (s) => {
    const start = new Date(s.startsAt || s.starts_at);
    const end = new Date(s.endsAt || s.ends_at);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
    const dayIndex = (start.getDay() || 7) - 1;
    
    // 计算位置 (假设每小时高度为 60px)
    const top = (start.getHours() - 8) * 60 + (start.getMinutes());
    const durationMin = (end.getTime() - start.getTime()) / (1000 * 60);
    const height = durationMin;

    return (
      <Link
        key={s.id}
        to={`/sessions/${s.id}/checkin`}
        className="absolute left-1 right-1 p-1.5 rounded-lg text-[10px] leading-tight font-bold border-l-4 overflow-hidden shadow-sm transition-transform active:scale-95"
        style={{
          top: `${top}px`,
          height: `${height}px`,
          backgroundColor: '#EEF2FF', // Indigo 50
          borderLeftColor: '#6366F1', // Indigo 500
          color: '#4338CA', // Indigo 700
          zIndex: 10
        }}
      >
        <div className="truncate">{s.courseTitle || s.course_title || s.title || '未命名课程'}</div>
        <div className="opacity-60 font-medium">{start.getHours()}:{String(start.getMinutes()).padStart(2, '0')}</div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-white pb-6 font-sans text-slate-900 select-none overflow-x-hidden">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <h2 className="text-xl font-black">{baseDate.getMonth() + 1}月</h2>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button onClick={() => changeWeek(-1)} className="p-2 hover:bg-white rounded-lg transition-all">←</button>
          <button onClick={() => setBaseDate(getMonday(new Date()))} className="px-3 text-xs font-bold">今天</button>
          <button onClick={() => changeWeek(1)} className="p-2 hover:bg-white rounded-lg transition-all">→</button>
        </div>
      </div>

      {/* 星期标题栏 */}
      <div className="grid grid-cols-[50px_1fr] border-b border-slate-100">
        <div className="flex items-center justify-center text-[10px] text-slate-400 font-bold uppercase">GMT+8</div>
        <div className="grid grid-cols-7 h-16">
          {weekDates.map((d, i) => (
            <div key={i} className="flex flex-col items-center justify-center">
              <span className="text-[10px] text-slate-400 font-bold mb-1">{WEEK_DAYS[i]}</span>
              <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-black ${
                d.toDateString() === new Date().toDateString() ? 'bg-indigo-600 text-white shadow-lg' : ''
              }`}>
                {d.getDate()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 滚动网格区域 */}
      <div className="relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={baseDate.toISOString()}
            custom={direction}
            initial={{ x: direction > 0 ? '100%' : '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? '-100%' : '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="grid grid-cols-[50px_1fr] relative bg-white"
          >
            {/* 时间轴刻度 */}
            <div className="bg-white border-r border-slate-50">
              {HOURS.map(h => (
                <div key={h} className="h-[60px] text-[10px] text-slate-300 font-medium flex justify-center pt-2">
                  {String(h).padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* 背景网格线 */}
            <div className="relative">
              {HOURS.map(h => (
                <div key={h} className="h-[60px] border-b border-slate-50 w-full" />
              ))}
              
              {/* 课程内容层 */}
              <div className="absolute inset-0 grid grid-cols-7">
                {[0, 1, 2, 3, 4, 5, 6].map(dayIdx => (
                  <div key={dayIdx} className="relative border-r border-slate-50/50 last:border-0">
                    {sessions
                      .filter(s => {
                        const d = new Date(s.startsAt);
                        return (d.getDay() || 7) - 1 === dayIdx;
                      })
                      .map(renderSessionCard)
                    }
                  </div>
                ))}
              </div>

              {/* 红色的当前时间线 (仅在当前周显示) */}
              {weekDates.some(d => d.toDateString() === new Date().toDateString()) && (
                <div 
                  className="absolute left-0 right-0 border-t-2 border-red-400 z-20 pointer-events-none"
                  style={{ top: `${(new Date().getHours() - 8) * 60 + new Date().getMinutes()}px` }}
                >
                  <div className="w-2 h-2 bg-red-400 rounded-full -mt-1 -ml-1" />
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
