import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createSession } from '../service/sessionService';
import { getCourse } from '../../course/service/courseService';

/** * 辅助函数：获取月份第一天
 */
function startOfMonth(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

/** * 辅助函数：构建日历网格 
 */
function buildCalendarGrid(monthDate) {
  const start = startOfMonth(monthDate);
  const startDay = start.getUTCDay(); // 0 Sunday
  const gridStart = new Date(start);
  gridStart.setUTCDate(start.getUTCDate() - startDay);
  const cells = [];
  for (let i = 0; i < 42; i += 1) {
    const d = new Date(gridStart);
    d.setUTCDate(gridStart.getUTCDate() + i);
    const iso = d.toISOString().slice(0, 10);
    cells.push({
      iso,
      day: d.getUTCDate(),
      inMonth: d.getUTCMonth() === monthDate.getUTCMonth(),
    });
  }
  return cells;
}

const hourOptions = Array.from({ length: 24 }, (_, h) => ({
  value: String(h).padStart(2, '0'),
  label: `${String(h).padStart(2, '0')}`,
}));

const minuteOptions = Array.from({ length: 12 }, (_, idx) => ({
  value: String(idx * 5).padStart(2, '0'),
  label: `${String(idx * 5).padStart(2, '0')}`,
}));

const weekdayLabels = ['日', '一', '二', '三', '四', '五', '六'];

/**
 * 优化后的 Apple 风格滚轮组件
 * 增加了 3D 透视感和更好的视觉反馈
 */
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
    <div className="flex flex-col items-center flex-1 min-w-[60px]">
      <span className="text-[10px] uppercase tracking-wider text-slate-400 mb-2 font-bold">{label}</span>
      <div className="relative h-32 w-full max-w-[80px]">
        {/* 高亮遮罩 */}
        <div className="absolute top-1/2 left-0 w-full h-9 -translate-y-1/2 bg-blue-50/50 border-y border-blue-200 pointer-events-none rounded-md z-0" />
        
        <div
          ref={containerRef}
          className="relative h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar z-10"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div className="py-[48px]">
            {options.map((opt) => {
              const isSelected = value === opt.value;
              return (
                <div
                  key={opt.value}
                  ref={(node) => (itemRefs.current[opt.value] = node)}
                  onClick={() => onChange(opt.value)}
                  className={`h-9 flex items-center justify-center snap-center cursor-pointer transition-all duration-300 select-none ${
                    isSelected 
                    ? 'text-blue-600 font-bold text-lg scale-110' 
                    : 'text-slate-400 text-sm opacity-50 hover:opacity-100'
                  }`}
                  style={{
                    perspective: '1000px',
                    transform: isSelected ? 'scale(1.1)' : 'scale(0.9)'
                  }}
                >
                  {opt.label}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// 图标组件 (SVG)
const IconChevron = ({ dir = "left" }) => (
  <svg className={`w-5 h-5 ${dir === 'right' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const IconPlus = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const IconTrash = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export default function App() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [blocks, setBlocks] = useState(() => {
    const today = new Date();
    return [
      {
        id: crypto.randomUUID(),
        month: startOfMonth(today),
        dates: new Set(),
        startHour: '09',
        startMinute: '00',
        endHour: '10',
        endMinute: '00',
      },
    ];
  });

  useEffect(() => {
    async function loadCourse() {
      try {
        const course = await getCourse(courseId);
        setCourseTitle(course.title || '');
        setLocation(course.location || '');
      } catch (err) {
        setCourseTitle('');
      }
    }
    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  const toggleDate = (blockId, iso) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        const dates = new Set(b.dates);
        if (dates.has(iso)) {
          dates.delete(iso);
        } else {
          dates.add(iso);
        }
        return { ...b, dates };
      })
    );
  };

  const changeMonth = (blockId, delta) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        const next = new Date(b.month);
        next.setUTCMonth(b.month.getUTCMonth() + delta);
        return { ...b, month: startOfMonth(next) };
      })
    );
  };

  const handleTimeChange = (blockId, key, value) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        const next = { ...b, [key]: value };
        const startMinutes = (Number(next.startHour) * 60) + Number(next.startMinute);
        const endMinutes = (Number(next.endHour) * 60) + Number(next.endMinute);
        if (endMinutes < startMinutes) {
          next.endHour = next.startHour;
          next.endMinute = next.startMinute;
        }
        return next;
      })
    );
  };

  const addBlock = () => {
    setBlocks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        month: startOfMonth(new Date()),
        dates: new Set(),
        startHour: '09',
        startMinute: '00',
        endHour: '10',
        endMinute: '00',
      },
    ]);
  };

  const removeBlock = (blockId) => {
    setBlocks((prev) => (prev.length > 1 ? prev.filter((b) => b.id !== blockId) : prev));
  };

  const formatMonthLabel = (monthDate) => {
    return `${monthDate.getUTCFullYear()}年 ${monthDate.getUTCMonth() + 1}月`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const toCreate = [];
    blocks.forEach((b) => {
      const startTime = `${b.startHour}:${b.startMinute}`;
      const endTime = `${b.endHour}:${b.endMinute}`;
      b.dates.forEach((iso) => {
        toCreate.push({
          startsAt: new Date(`${iso}T${startTime}:00`).toISOString(),
          endsAt: new Date(`${iso}T${endTime}:00`).toISOString(),
        });
      });
    });

    if (toCreate.length === 0) {
      setError('请至少选择一个日期');
      setLoading(false);
      return;
    }

    try {
      for (const s of toCreate) {
        await createSession(courseId, { ...s, location });
      }
      navigate(`/courses/${courseId}`);
    } catch (err) {
      setError(err.response?.data?.error || '创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24 font-sans text-slate-900">
      {/* 顶部导航条 */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          新增课次
        </h1>
        {courseTitle && (
          <div className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
            课程：{courseTitle}
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 地点输入卡片 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-3">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span>
              上课地点
            </label>
            <input 
              value={location} 
              onChange={(e) => setLocation(e.target.value)} 
              placeholder="默认使用课程地点"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* 循环渲染日期块 */}
          {blocks.map((b, idx) => {
            const days = buildCalendarGrid(b.month);
            return (
              <div key={b.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* 块标题 */}
                <div className="bg-slate-50/50 px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">时间段 {idx + 1}</span>
                  {blocks.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeBlock(b.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                    >
                      <IconTrash />
                    </button>
                  )}
                </div>

                <div className="p-5 space-y-6">
                  {/* 月份切换器 */}
                  <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-1">
                    <button 
                      type="button" 
                      className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-600"
                      onClick={() => changeMonth(b.id, -1)}
                    >
                      <IconChevron dir="left" />
                    </button>
                    <div className="font-bold text-slate-700">{formatMonthLabel(b.month)}</div>
                    <button 
                      type="button" 
                      className="p-2 hover:bg-white hover:shadow-sm rounded-xl transition-all text-slate-600"
                      onClick={() => changeMonth(b.id, 1)}
                    >
                      <IconChevron dir="right" />
                    </button>
                  </div>

                  {/* 日历网格 */}
                  <div className="space-y-1">
                    <div className="grid grid-cols-7 mb-2">
                      {weekdayLabels.map((w) => (
                        <div key={w} className="text-center text-[10px] font-bold text-slate-400 py-1">
                          {w}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {days.map((d) => {
                        const isSelected = b.dates.has(d.iso);
                        return (
                          <div
                            key={d.iso}
                            onClick={() => toggleDate(b.id, d.iso)}
                            className={`
                              relative aspect-square flex items-center justify-center text-sm rounded-xl cursor-pointer transition-all duration-200
                              ${!d.inMonth ? 'text-slate-200' : 'text-slate-600 hover:bg-blue-50 hover:text-blue-300'}
                              ${isSelected ? 'bg-blue-300 text-white font-bold shadow-lg shadow-blue-200 scale-95 hover:bg-blue-700 hover:text-white' : ''}
                            `}
                          >
                            {d.day}
                            {isSelected && (
                              <span className="absolute bottom-1 w-1 h-1 bg-white rounded-full opacity-50"></span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 时间选择器 */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                    <div className="space-y-3">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center block">开始时间</label>
                      <div className="flex bg-slate-50 rounded-2xl p-2 border border-slate-100">
                        <AppleWheelPicker
                          label="时"
                          value={b.startHour}
                          options={hourOptions}
                          onChange={(val) => handleTimeChange(b.id, 'startHour', val)}
                        />
                        <div className="w-px h-12 bg-slate-200 self-center opacity-50" />
                        <AppleWheelPicker
                          label="分"
                          value={b.startMinute}
                          options={minuteOptions}
                          onChange={(val) => handleTimeChange(b.id, 'startMinute', val)}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center block">结束时间</label>
                      <div className="flex bg-slate-50 rounded-2xl p-2 border border-slate-100">
                        <AppleWheelPicker
                          label="时"
                          value={b.endHour}
                          options={hourOptions}
                          onChange={(val) => handleTimeChange(b.id, 'endHour', val)}
                        />
                        <div className="w-px h-12 bg-slate-200 self-center opacity-50" />
                        <AppleWheelPicker
                          label="分"
                          value={b.endMinute}
                          options={minuteOptions}
                          onChange={(val) => handleTimeChange(b.id, 'endMinute', val)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 状态统计 */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium px-1 pt-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      已选 {b.dates.size} 个日期
                    </div>
                    {b.dates.size > 0 && (
                      <button 
                        type="button" 
                        onClick={() => setBlocks(prev => prev.map(item => item.id === b.id ? {...item, dates: new Set()} : item))}
                        className="text-blue-500 hover:underline"
                      >
                        清除已选
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-2xl animate-bounce">
              {error}
            </div>
          )}

          {/* 提交按钮 */}
          <button 
            type="submit" 
            disabled={loading}
            className={`
              w-full py-4 rounded-2xl font-bold text-white shadow-xl transition-all active:scale-95
              ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-200 hover:opacity-90'}
            `}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                正在同步中...
              </span>
            ) : '确认批量创建课次'}
          </button>
        </form>
      </div>

      {/* 悬浮添加按钮 */}
      <button 
        type="button" 
        onClick={addBlock}
        className="fixed bottom-8 right-8 w-14 h-14 bg-white text-blue-600 shadow-2xl rounded-full flex items-center justify-center hover:scale-110 active:scale-90 transition-all border border-slate-100 z-40 group"
      >
        <div className="absolute inset-0 bg-blue-50 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 z-0" />
        <div className="relative z-10"><IconPlus /></div>
      </button>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
