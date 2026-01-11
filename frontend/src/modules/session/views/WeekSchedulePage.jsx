import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { listWeekSessions } from '../service/sessionService';

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - (day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

const WEEK_DAYS = ['一', '二', '三', '四', '五', '六', '日'];
const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); 

// 定义动画变体，解决动画方向错误
const variants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
  }),
};

export default function WeekSchedulePage() {
  const [baseDate, setBaseDate] = useState(getMonday(new Date()));
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(0);

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
        const normalized = (data || []).map((s) => ({
          ...s,
          startsAt: s.starts_at || s.startsAt,
          endsAt: s.ends_at || s.endsAt,
          courseTitle: s.course_title || s.courseTitle || s.title,
        }));
        setSessions(normalized);
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [baseDate]);

  const changeWeek = (delta) => {
    setDirection(delta);
    const newDate = new Date(baseDate);
    newDate.setDate(baseDate.getDate() + delta * 7);
    setBaseDate(newDate);
  };

  const renderSessionCard = (s) => {
    const start = new Date(s.startsAt);
    const end = new Date(s.endsAt);
    if (Number.isNaN(start.getTime())) return null;

    const top = (start.getHours() - 8) * 60 + start.getMinutes();
    const durationMin = (end.getTime() - start.getTime()) / (1000 * 60);
    // 确保最小高度，防止短课程文字挤压
    const height = Math.max(durationMin, 35);

    return (
      <Link
        key={s.id}
        to={`/sessions/${s.id}/checkin`}
        className="absolute left-[2px] right-[2px] p-1 rounded-md text-[10px] border-l-[3px] shadow-sm flex flex-col justify-between overflow-hidden transition-all hover:brightness-95 active:scale-[0.98]"
        style={{
          top: `${top}px`,
          height: `${height}px`,
          backgroundColor: '#f5f7ff',
          borderLeftColor: '#6366F1',
          color: '#3730a3',
          zIndex: 10,
        }}
      >
        {/* 解决文字省略：使用 line-clamp 允许显示两行，且缩小行高 */}
        <div className="font-bold leading-[1.1] line-clamp-2 break-all tracking-tighter">
          {s.courseTitle || '未命名'}
        </div>
        <div className="text-[9px] opacity-50 font-medium tabular-nums">
          {start.getHours()}:{String(start.getMinutes()).padStart(2, '0')}
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-white pb-20 font-sans text-slate-900 select-none overflow-hidden">
      {/* 顶部标题与切换 */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-50">
        <h2 className="text-xl font-black tracking-tight">{baseDate.getMonth() + 1}月</h2>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button onClick={() => changeWeek(-1)} className="p-2 hover:bg-white rounded-lg transition-all text-slate-600">←</button>
          <button onClick={() => setBaseDate(getMonday(new Date()))} className="px-4 text-xs font-bold text-indigo-600">今天</button>
          <button onClick={() => changeWeek(1)} className="p-2 hover:bg-white rounded-lg transition-all text-slate-600">→</button>
        </div>
      </div>

      {/* 星期标题 */}
      <div className="grid grid-cols-[50px_1fr] border-b border-slate-100 bg-slate-50/30">
        <div className="flex items-center justify-center text-[10px] text-slate-300 font-bold">GMT+8</div>
        <div className="grid grid-cols-7 h-14">
          {weekDates.map((d, i) => {
            const isToday = d.toDateString() === new Date().toDateString();
            return (
              <div key={i} className="flex flex-col items-center justify-center">
                <span className={`text-[10px] font-bold mb-1 ${isToday ? 'text-indigo-500' : 'text-slate-400'}`}>
                  {WEEK_DAYS[i]}
                </span>
                <span className={`text-sm font-black transition-all ${isToday ? 'text-indigo-600 scale-110' : 'text-slate-700'}`}>
                  {d.getDate()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 动画容器 */}
      <div className="relative h-[900px]">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={baseDate.toISOString()}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            className="absolute inset-0 grid grid-cols-[50px_1fr] bg-white"
          >
            {/* 时间轴刻度 */}
            <div className="border-r border-slate-50">
              {HOURS.map(h => (
                <div key={h} className="h-[60px] text-[10px] text-slate-300 font-medium flex justify-center pt-2 tabular-nums">
                  {String(h).padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* 网格与课程 */}
            <div className="relative">
              {HOURS.map(h => (
                <div key={h} className="h-[60px] border-b border-slate-50 w-full" />
              ))}
              
              <div className="absolute inset-0 grid grid-cols-7">
                {[0, 1, 2, 3, 4, 5, 6].map(dayIdx => (
                  <div key={dayIdx} className="relative border-r border-slate-50/50 last:border-0">
                    {sessions
                      .filter(s => (new Date(s.startsAt).getDay() || 7) - 1 === dayIdx)
                      .map(renderSessionCard)
                    }
                  </div>
                ))}
              </div>

              {/* 时间红线 */}
              {weekDates.some(d => d.toDateString() === new Date().toDateString()) && (
                <div 
                  className="absolute left-0 right-0 border-t border-red-400 z-20 pointer-events-none"
                  style={{ top: `${(new Date().getHours() - 8) * 60 + new Date().getMinutes()}px` }}
                >
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full -mt-[3.5px] -ml-[3px]" />
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}