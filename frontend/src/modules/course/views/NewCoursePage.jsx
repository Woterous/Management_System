import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCourse } from '../service/courseService';

export default function NewCoursePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    location: '',
    totalPlannedSessions: 0,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createCourse({
        title: form.title,
        location: form.location,
        totalPlannedSessions: Number(form.totalPlannedSessions) || 0,
      });
      navigate('/courses');
    } catch (err) {
      setError(err.response?.data?.error || '创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-card">
      <div className="page-header">
        <h2 className="page-title">新建课程</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label>课程名称</label>
          <input value={form.title} onChange={handleChange('title')} required placeholder="请输入课程名称" />
        </div>
        <div className="form-field">
          <label>上课地点</label>
          <input value={form.location} onChange={handleChange('location')} placeholder="可选" />
        </div>
        <div className="form-field">
          <label>计划总课次</label>
          <input
            type="number"
            min="0"
            value={form.totalPlannedSessions}
            onChange={handleChange('totalPlannedSessions')}
            required
          />
        </div>
        {error && <div style={{ color: '#b91c1c', marginBottom: 12 }}>{error}</div>}
        <button className="button" type="submit" disabled={loading}>
          {loading ? '创建中…' : '创建课程'}
        </button>
      </form>
    </div>
  );
}
