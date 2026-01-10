import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createSession } from '../service/sessionService';

function startOfMonth(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

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

const hourOptions = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, '0'));
const minuteOptions = Array.from({ length: 12 }, (_, idx) => String(idx * 5).padStart(2, '0'));

const weekdayLabels = ['日', '一', '二', '三', '四', '五', '六'];

export default function NewSessionPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
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
        const startMinutes = timeToMinutes(next.startHour, next.startMinute);
        const endMinutes = timeToMinutes(next.endHour, next.endMinute);
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
        startTime: '09:00',
        endTime: '10:00',
      },
    ]);
  };

  const removeBlock = (blockId) => {
    setBlocks((prev) => (prev.length > 1 ? prev.filter((b) => b.id !== blockId) : prev));
  };

  const compareTime = (a, b) => {
    const [ah, am] = a.split(':').map(Number);
    const [bh, bm] = b.split(':').map(Number);
    return ah === bh ? am - bm : ah - bh;
  };

  const timeToMinutes = (h, m) => Number(h) * 60 + Number(m);
  const fmt = (h, m) => `${h}:${m}`;

  const formatMonthLabel = (monthDate) => {
    return `${monthDate.getUTCFullYear()}年${monthDate.getUTCMonth() + 1}月`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 展开所有要创建的课次
    const toCreate = [];
    blocks.forEach((b) => {
      const startTime = fmt(b.startHour, b.startMinute);
      const endTime =
        timeToMinutes(b.endHour, b.endMinute) >= timeToMinutes(b.startHour, b.startMinute)
          ? fmt(b.endHour, b.endMinute)
          : startTime;
      b.dates.forEach((iso) => {
        toCreate.push({
          date: iso,
          startTime,
          endTime,
          startsAt: new Date(`${iso}T${startTime}:00`).toISOString(),
          endsAt: new Date(`${iso}T${endTime}:00`).toISOString(),
        });
      });
    });

    // 本地重复检测：同一日期+开始时间重复
    const seen = new Set();
    const dup = [];
    toCreate.forEach((s) => {
      const key = `${s.date}-${s.startTime}`;
      if (seen.has(key)) dup.push(key);
      else seen.add(key);
    });
    if (dup.length > 0) {
      alert(`以下日期时间重复：\n${dup.join('\n')}`);
      setLoading(false);
      return;
    }

    try {
      for (const s of toCreate) {
        await createSession(courseId, {
          startsAt: s.startsAt,
          endsAt: s.endsAt,
          location,
        });
      }
      navigate(`/courses/${courseId}`);
    } catch (err) {
      if (err.response?.status === 409) {
        setError('与已有课次冲突，检查相同开始时间是否已存在');
      } else {
        setError(err.response?.data?.error || '创建失败');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-card">
      <div className="page-header">
        <h2 className="page-title">新增课次（批量）</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label>地点（可选）</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="默认用课程地点" />
        </div>

        {blocks.map((b, idx) => {
          const days = buildCalendarGrid(b.month);
          return (
            <div key={b.id} className="date-block">
              <div className="date-block-header">
                <strong>课程日期格子 {idx + 1}</strong>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button type="button" className="button secondary" onClick={() => changeMonth(b.id, -1)}>
                    上个月
                  </button>
                  <div style={{ minWidth: 110, textAlign: 'center', fontWeight: 700 }}>{formatMonthLabel(b.month)}</div>
                  <button type="button" className="button secondary" onClick={() => changeMonth(b.id, 1)}>
                    下个月
                  </button>
                  {blocks.length > 1 && (
                    <button type="button" className="button secondary" onClick={() => removeBlock(b.id)}>
                      删除
                    </button>
                  )}
                </div>
              </div>
              <div className="calendar-weekdays">
                {weekdayLabels.map((w) => (
                  <div key={w} className="calendar-cell muted" style={{ fontWeight: 700, background: 'transparent', border: 'none' }}>
                    {w}
                  </div>
                ))}
              </div>
              <div className="calendar-grid">
                {days.map((d) => {
                  const selected = b.dates.has(d.iso);
                  return (
                    <div
                      key={d.iso}
                      className={`calendar-cell ${d.inMonth ? '' : 'muted'} ${selected ? 'selected' : ''}`}
                      onClick={() => toggleDate(b.id, d.iso)}
                    >
                      {d.day}
                    </div>
                  );
                })}
              </div>
              <div className="time-row">
                <div className="form-field" style={{ flex: 1 }}>
                  <label>开始</label>
                  <div className="time-picker">
                    <select
                      value={b.startHour}
                      onChange={(e) => handleTimeChange(b.id, 'startHour', e.target.value)}
                      size={5}
                      className="time-wheel"
                    >
                      {hourOptions.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                    <span className="time-sep">:</span>
                    <select
                      value={b.startMinute}
                      onChange={(e) => handleTimeChange(b.id, 'startMinute', e.target.value)}
                      size={5}
                      className="time-wheel"
                    >
                      {minuteOptions.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <div className="time-display">{fmt(b.startHour, b.startMinute)}</div>
                  </div>
                </div>
                <div className="form-field" style={{ flex: 1 }}>
                  <label>结束</label>
                  <div className="time-picker">
                    <select
                      value={b.endHour}
                      onChange={(e) => handleTimeChange(b.id, 'endHour', e.target.value)}
                      size={5}
                      className="time-wheel"
                    >
                      {hourOptions.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                    <span className="time-sep">:</span>
                    <select
                      value={b.endMinute}
                      onChange={(e) => handleTimeChange(b.id, 'endMinute', e.target.value)}
                      size={5}
                      className="time-wheel"
                    >
                      {minuteOptions.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <div className="time-display">{fmt(b.endHour, b.endMinute)}</div>
                  </div>
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    若未选或早于开始时间，会自动跟随开始时间
                  </span>
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#475569' }}>
                已选日期：{b.dates.size} 个
              </div>
            </div>
          );
        })}

        {error && <div style={{ color: '#b91c1c', margin: '12px 0' }}>{error}</div>}
        <button className="button" type="submit" disabled={loading}>
          {loading ? '创建中…' : '批量创建课次'}
        </button>
      </form>
      <button className="floating-add" type="button" onClick={addBlock} title="添加课程日期格子">
        ＋
      </button>
    </div>
  );
}
