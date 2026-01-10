import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStudent } from '../service/studentService';

export default function NewStudentPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    studentNo: '',
    age: '',
    note: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createStudent({
        name: form.name,
        studentNo: form.studentNo || undefined,
        age: form.age ? Number(form.age) : undefined,
        note: form.note || undefined,
      });
      navigate(-1);
    } catch (err) {
      setError(err.response?.data?.error || '创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-card">
      <div className="page-header">
        <h2 className="page-title">新建学生</h2>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label>姓名</label>
          <input value={form.name} onChange={handleChange('name')} required placeholder="学生姓名" />
        </div>
        <div className="form-field">
          <label>学号（可选）</label>
          <input value={form.studentNo} onChange={handleChange('studentNo')} placeholder="学号" />
        </div>
        <div className="form-field">
          <label>年龄（可选）</label>
          <input type="number" min="0" value={form.age} onChange={handleChange('age')} placeholder="年龄" />
        </div>
        <div className="form-field">
          <label>备注（可选）</label>
          <textarea value={form.note} onChange={handleChange('note')} placeholder="备注" rows={3} />
        </div>
        {error && <div style={{ color: '#b91c1c', marginBottom: 12 }}>{error}</div>}
        <button className="button" type="submit" disabled={loading}>
          {loading ? '创建中…' : '创建学生'}
        </button>
      </form>
    </div>
  );
}
