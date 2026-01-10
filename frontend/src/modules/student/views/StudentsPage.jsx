import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listStudents } from '../service/studentService';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = (keyword) => {
    setLoading(true);
    listStudents(keyword)
      .then((res) => setStudents(res))
      .catch((err) => setError(err.response?.data?.error || '加载失败'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="page-card">
      <div className="page-header">
        <h2 className="page-title">学生列表</h2>
        <Link className="button" to="/students/new">
          新建学生
        </Link>
      </div>
      <div className="form-field">
        <label>搜索姓名/学号</label>
        <input
          value={q}
          onChange={(e) => {
            const val = e.target.value;
            setQ(val);
            load(val);
          }}
          placeholder="输入关键字搜索"
        />
      </div>
      {loading ? (
        <p>加载中…</p>
      ) : error ? (
        <p style={{ color: '#b91c1c' }}>{error}</p>
      ) : students.length === 0 ? (
        <p>暂无学生</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {students.map((s) => (
            <li key={s.id} style={{ padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700 }}>
                {s.name} {s.student_no ? `(${s.student_no})` : ''}
              </div>
              <div style={{ color: '#64748b', fontSize: 13 }}>
                {s.age != null ? `年龄 ${s.age}` : '年龄未填'}
              </div>
              <Link className="button secondary" to={`/students/${s.id}/stats`} style={{ marginTop: 6, display: 'inline-block' }}>
                查看出勤
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
