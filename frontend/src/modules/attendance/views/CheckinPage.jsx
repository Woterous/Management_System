import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSessionDetail, openSession, saveAttendance, closeSession } from '../../session/service/sessionService';
import { listCourseStudents } from '../../course/service/courseService';

const statusOptions = [
  { value: 'present', label: '出勤' },
  { value: 'late', label: '迟到' },
  { value: 'leave', label: '请假' },
  { value: 'absent', label: '缺勤' },
];

export default function CheckinPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const load = async () => {
    try {
      const data = await getSessionDetail(sessionId);
      setSession(data.session);
      if (data.attendance && data.attendance.length > 0) {
        setRecords(data.attendance);
      } else if (data.session?.course_id) {
        const students = await listCourseStudents(data.session.course_id);
        setRecords(
          students.map((s) => ({
            id: `${s.id}-temp`,
            student_id: s.id,
            name: s.name,
            student_no: s.student_no,
            status: 'present',
            note: '',
          }))
        );
      } else {
        setRecords([]);
      }
    } catch (err) {
      setError(err.response?.data?.error || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [sessionId]);

  const handleStatusChange = (studentId, status) => {
    setRecords((prev) =>
      prev.map((r) => (r.student_id === studentId ? { ...r, status } : r))
    );
  };

  const handleNoteChange = (studentId, note) => {
    setRecords((prev) =>
      prev.map((r) => (r.student_id === studentId ? { ...r, note } : r))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (session.status === 'scheduled') {
        await openSession(sessionId);
      }
      await saveAttendance(
        sessionId,
        records.map((r) => ({
          studentId: r.student_id,
          status: r.status,
          note: r.note || null,
        }))
      );
      await closeSession(sessionId);
      setToast('已保存并关闭，返回课表中…');
      setTimeout(() => navigate('/'), 800);
    } catch (err) {
      setError(err.response?.data?.error || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleOpen = async () => {
    try {
      await openSession(sessionId);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || '开始失败');
    }
  };

  const handleClose = async () => {
    try {
      await closeSession(sessionId);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || '关闭失败');
    }
  };

  if (loading) return <p>加载中…</p>;
  if (error) return <p style={{ color: '#b91c1c' }}>{error}</p>;
  if (!session) return <p>未找到课次</p>;

  return (
    <div className="page-card">
      <div className="page-header">
        <div>
          <h2 className="page-title">签到 · {session.course_title || session.title}</h2>
          <div style={{ color: '#64748b', fontSize: 14 }}>
            {new Date(session.starts_at).toLocaleString()} — {new Date(session.ends_at).toLocaleTimeString()} ·{' '}
            {session.location || '未填写'} · 状态 {session.status}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {session.status === 'scheduled' && (
            <button className="button" type="button" onClick={handleOpen}>
              开始本节课
            </button>
          )}
          {session.status === 'open' && (
            <button className="button secondary" type="button" onClick={handleClose}>
              关闭课次
            </button>
          )}
        </div>
      </div>

      {records.length === 0 ? (
        <p>暂无学生，请先在课程中添加学生。</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '8px' }}>学生</th>
                <th style={{ padding: '8px' }}>状态</th>
                <th style={{ padding: '8px' }}>备注</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px' }}>
                    {r.name} {r.student_no ? `(${r.student_no})` : ''}
                  </td>
                  <td style={{ padding: '8px' }}>
                    <select
                      value={r.status}
                      onChange={(e) => handleStatusChange(r.student_id, e.target.value)}
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input
                      value={r.note || ''}
                      onChange={(e) => handleNoteChange(r.student_id, e.target.value)}
                      placeholder="备注"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <button className="button" type="button" onClick={handleSave} disabled={saving}>
          {saving ? '保存中…' : '保存签到'}
        </button>
      </div>
      {toast && <div className="success-toast">{toast}</div>}
    </div>
  );
}
