import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createSession } from '../service/sessionService';

export default function NewSessionPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    startTime: '09:00',
    endTime: '10:00',
    location: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const timeOptions = useMemo(() => {
    const slots = [];
    for (let h = 0; h < 24; h += 1) {
      for (let m = 0; m < 60; m += 30) {
        slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }
    return slots;
  }, []);

  const handleChange = (key) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    // 当开始时间改变且结束时间为空或比开始时间早时，自动同步
    const start = form.startTime;
    const end = form.endTime;
    if (!end || compareTime(end, start) < 0) {
      setForm((prev) => ({ ...prev, endTime: start }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.startTime]);

  const compareTime = (a, b) => {
    // a, b: "HH:MM"
    const [ah, am] = a.split(':').map(Number);
    const [bh, bm] = b.split(':').map(Number);
    return ah === bh ? am - bm : ah - bh;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const startsAtIso = new Date(`${form.date}T${form.startTime}:00`).toISOString();
      const endsAtIso = new Date(`${form.date}T${form.endTime}:00`).toISOString();
      await createSession(courseId, {
        startsAt: startsAtIso,
        endsAt: endsAtIso,
        location: form.location,
      });
      navigate(`/courses/${courseId}`);
    } catch (err) {
      setError(err.response?.data?.error || '创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-card">
      <div className="page-header">
        <h2 className="page-title">新增课次</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label>日期</label>
          <input type="date" value={form.date} onChange={handleChange('date')} required />
        </div>
        <div className="form-field">
          <label>开始时间（滚轮选择）</label>
          <select
            value={form.startTime}
            onChange={handleChange('startTime')}
            size={5}
            style={{ width: '100%', padding: 8 }}
          >
            {timeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label>结束时间（滚轮选择）</label>
          <select
            value={form.endTime}
            onChange={handleChange('endTime')}
            size={5}
            style={{ width: '100%', padding: 8 }}
          >
            {timeOptions.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <span style={{ fontSize: 12, color: '#64748b' }}>
            若未选或早于开始时间，会自动跟随开始时间
          </span>
        </div>
        <div className="form-field">
          <label>地点</label>
          <input value={form.location} onChange={handleChange('location')} placeholder="可选，默认用课程地点" />
        </div>
        {error && <div style={{ color: '#b91c1c', marginBottom: 12 }}>{error}</div>}
        <button className="button" type="submit" disabled={loading}>
          {loading ? '创建中…' : '创建课次'}
        </button>
      </form>
    </div>
  );
}
