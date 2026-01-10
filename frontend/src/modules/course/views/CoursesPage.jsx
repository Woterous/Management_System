import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listCourses } from '../service/courseService';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    listCourses()
      .then((data) => {
        if (mounted) setCourses(data);
      })
      .catch((err) => setError(err.response?.data?.error || '加载失败'))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="page-card">
      <div className="page-header">
        <h2 className="page-title">课程列表</h2>
        <Link className="button" to="/courses/new">
          新建课程
        </Link>
      </div>
      {loading ? (
        <p>加载中…</p>
      ) : error ? (
        <p style={{ color: '#b91c1c' }}>{error}</p>
      ) : courses.length === 0 ? (
        <p>暂无课程，去新建一个吧。</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {courses.map((c) => (
            <li key={c.id} style={{ padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
              <Link to={`/courses/${c.id}`}>
                <div style={{ fontWeight: 700 }}>{c.title}</div>
                <div style={{ color: '#64748b', fontSize: 14 }}>
                  地点：{c.location || '未填写'} · 计划课次：{c.total_planned_sessions}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
