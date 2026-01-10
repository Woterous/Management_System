import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { listCourses } from '../../course/service/courseService';
import { getStudentCourseStats } from '../../stats/service/statsService';

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

const statusColors = {
  present: '#16a34a',
  late: '#f97316',
  leave: '#0ea5e9',
  absent: '#dc2626',
};

export default function StudentStatsPage() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
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

  const [year, monthNum] = month.split('-').map((n) => Number(n));
  const monthDays = buildMonthDays(year, monthNum - 1);
  const recordMap = groupByDate(records);

  return (
    <div className="page-card">
      <div className="page-header">
        <h2 className="page-title">学生出勤</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="button secondary" type="button" onClick={() => navigate(-1)}>
            返回
          </button>
        </div>
      </div>
      <div className="form-field">
        <label>选择课程</label>
        <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>
      <div className="form-field">
        <label>选择月份</label>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      </div>
      {loading ? (
        <p>加载中…</p>
      ) : error ? (
        <p style={{ color: '#b91c1c' }}>{error}</p>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            {Object.entries({
              present: '出勤',
              late: '迟到',
              leave: '请假',
              absent: '缺勤',
            }).map(([key, label]) => (
              <div key={key} style={{ fontSize: 14 }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: 12,
                    height: 12,
                    background: statusColors[key],
                    borderRadius: 3,
                    marginRight: 6,
                  }}
                ></span>
                {label}: {summary?.[key] || 0}
              </div>
            ))}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 8,
              background: '#f8fafc',
              padding: 12,
              borderRadius: 12,
            }}
          >
            {monthDays.map((d) => {
              const key = d.toISOString().slice(0, 10);
              const rec = recordMap.get(key);
              const status = rec?.status;
              return (
                <div
                  key={key}
                  style={{
                    borderRadius: 10,
                    padding: 8,
                    minHeight: 70,
                    background: status ? statusColors[status] + '22' : '#fff',
                    border: `1px solid ${status ? statusColors[status] + '55' : '#e2e8f0'}`,
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{d.getUTCDate()}</div>
                  <div style={{ fontSize: 12, color: '#475569' }}>
                    {status ? statusLabels(status) : '无记录'}
                  </div>
                  {rec?.note && <div style={{ fontSize: 12, color: '#0f172a' }}>{rec.note}</div>}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function statusLabels(status) {
  switch (status) {
    case 'present':
      return '出勤';
    case 'late':
      return '迟到';
    case 'leave':
      return '请假';
    case 'absent':
      return '缺勤';
    default:
      return '无';
  }
}
