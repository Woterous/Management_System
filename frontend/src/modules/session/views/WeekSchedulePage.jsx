import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listWeekSessions } from '../service/sessionService';

function getWeekRangeISO() {
  const now = new Date();
  const day = now.getDay() || 7; // Monday as 1
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
    <div className="page-card">
      <div className="page-header">
        <h2 className="page-title">本周课表</h2>
        <Link className="button" to="/courses">
          课程列表
        </Link>
      </div>
      {loading ? (
        <p>加载中…</p>
      ) : error ? (
        <p style={{ color: '#b91c1c' }}>{error}</p>
      ) : sessions.length === 0 ? (
        <p>本周暂无排课。</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {sessions.map((s) => (
            <li key={s.id} style={{ padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700 }}>{s.course_title || s.title}</div>
              <div style={{ color: '#64748b', fontSize: 14 }}>
                {new Date(s.starts_at).toLocaleString()} — {new Date(s.ends_at).toLocaleTimeString()} ·{' '}
                {s.location || '未填写'}
              </div>
              <div style={{ marginTop: 8 }}>
                <Link className="button secondary" to={`/sessions/${s.id}/checkin`}>
                  进入签到
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
