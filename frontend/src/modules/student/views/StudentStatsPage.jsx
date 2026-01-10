import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { listCourses } from '../../course/service/courseService';
import { getStudentCourseStats } from '../../stats/service/statsService';

// --- 辅助函数与常量保持不变 ---
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
    date.setUTCDate(date.setUTCDate() + 1);
  }
  return days;
}

const statusColors = {
  present: '#16a34a',
  late: '#f97316',
  leave: '#0ea5e9',
  absent: '#dc2626',
};

// --- 新增：iOS 风格滚轮组件 ---
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
    <div className="flex flex-col items-center">
      <span className="text-xs text-gray-400 mb-2 font-medium">{label}</span>
      <div
        ref={containerRef}
        className="relative h-32 w-24 overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-gray-50 rounded-xl border border-gray-100"
      >
        {/* 选中框高亮 */}
        <div className="absolute top-1/2 left-0 w-full h-8 -translate-y-1/2 border-y border-blue-500/20 bg-blue-50/50 pointer-events-none"></div>
        <div className="py-12">
          {options.map((opt) => (
            <div
              key={opt.value}
              ref={(node) => (itemRefs.current[opt.value] = node)}
              onClick={() => onChange(opt.value)}
              className={`h-8 flex items-center justify-center snap-center cursor-pointer transition-all duration-300 ${
                value === opt.value ? 'text-blue-600 font-bold text-lg' : 'text-gray-400 text-sm scale-90'
              }`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function StudentStatsPage() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  
  // 拆分状态以便滚轮操作
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 接口逻辑完全保留
  useEffect(() => {
    listCourses()
      .then((res) => {
        setCourses(res);
        if (res[0]) setCourseId(res[0].id);
      })
      .catch((err) => setError(err.response?.data?.error || '加载课程失败'));
  }, []);

  useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    setError('');
    getStudentCourseStats(courseId, studentId)
      .then((res) => {
        setSummary(res.summary || {});
        setRecords(res.records || []);
      })
      .catch((err) => setError(err.response?.data?.error || '加载统计失败'))
      .finally(() => setLoading(false));
  }, [courseId, studentId]);

  // 计算属性
  const monthDays = buildMonthDays(selectedYear, selectedMonth - 1);
  const recordMap = groupByDate(records);

  // 滚轮选项数据
  const years = Array.from({ length: 10 }, (_, i) => ({ value: 2020 + i, label: `${2020 + i}年` }));
  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `${i + 1}月` }));

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white min-h-screen font-sans antialiased">
      {/* 头部区域 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">学生出勤</h2>
          <p className="text-gray-400 text-sm mt-1">查看详细出勤统计记录</p>
        </div>
        <button 
          className="px-5 py-2 rounded-full bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 transition-all active:scale-95" 
          onClick={() => navigate(-1)}
        >
          返回
        </button>
      </div>

      {/* 核心筛选区：iOS 滚轮样式 */}
      <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100 mb-8">
        <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
          {/* 课程选择 - 保持简洁下拉 */}
          <div className="w-full md:w-1/2 space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">当前课程</label>
            <select 
              className="w-full bg-white border-none rounded-2xl p-4 shadow-sm ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
              value={courseId} 
              onChange={(e) => setCourseId(e.target.value)}
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          {/* 时间滚轮组 */}
          <div className="flex gap-4 items-end bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <AppleWheelPicker 
              label="年份"
              options={years} 
              value={selectedYear} 
              onChange={setSelectedYear} 
            />
            <div className="h-20 w-px bg-gray-100 self-center"></div>
            <AppleWheelPicker 
              label="月份"
              options={months} 
              value={selectedMonth} 
              onChange={setSelectedMonth} 
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 animate-pulse">正在获取统计数据...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-500 rounded-2xl text-center border border-red-100">{error}</div>
      ) : (
        <>
          {/* 统计概览 */}
          <div className="grid grid-cols-4 gap-3 mb-8">
            {Object.entries({
              present: ['出勤', 'bg-green-500'],
              late: ['迟到', 'bg-orange-500'],
              leave: ['请假', 'bg-blue-500'],
              absent: ['缺勤', 'bg-red-500'],
            }).map(([key, [label, colorClass]]) => (
              <div key={key} className="bg-white border border-gray-100 p-3 rounded-2xl shadow-sm flex flex-col items-center">
                <span className={`w-2 h-2 rounded-full ${colorClass} mb-1`}></span>
                <span className="text-[10px] text-gray-400 font-bold uppercase">{label}</span>
                <span className="text-lg font-bold text-gray-800">{summary?.[key] || 0}</span>
              </div>
            ))}
          </div>

          {/* 日历网格 */}
          <div className="grid grid-cols-7 gap-2">
            {['日', '一', '二', '三', '四', '五', '六'].map(w => (
                <div key={w} className="text-center text-[10px] font-bold text-gray-300 pb-2">{w}</div>
            ))}
            {monthDays.map((d) => {
              const key = d.toISOString().slice(0, 10);
              const rec = recordMap.get(key);
              const status = rec?.status;
              return (
                <div
                  key={key}
                  className={`relative group flex flex-col items-center justify-center min-h-[80px] rounded-2xl transition-all duration-300 border ${
                    status 
                    ? 'bg-white shadow-md scale-100 border-transparent' 
                    : 'bg-gray-50/50 border-gray-100'
                  }`}
                >
                  <div className={`text-sm font-bold ${status ? 'text-gray-900' : 'text-gray-400'}`}>
                    {d.getUTCDate()}
                  </div>
                  
                  {status ? (
                    <div className="mt-1 flex flex-col items-center">
                        <div className="w-1.5 h-1.5 rounded-full mb-1" style={{ backgroundColor: statusColors[status] }}></div>
                        <span className="text-[10px] font-medium" style={{ color: statusColors[status] }}>
                           {statusLabels(status)}
                        </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-gray-300 mt-1 italic">空</span>
                  )}

                  {rec?.note && (
                    <div className="absolute inset-0 bg-white/95 rounded-2xl p-2 text-[10px] flex items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-opacity border border-blue-100">
                        {rec.note}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* 隐藏的辅助 CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}

function statusLabels(status) {
  const labels = { present: '出勤', late: '迟到', leave: '请假', absent: '缺勤' };
  return labels[status] || '无记录';
}
