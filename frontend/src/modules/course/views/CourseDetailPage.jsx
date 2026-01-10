import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getCourse,
  listCourseStudents,
  listCourseSessions,
  addStudentToCourse,
  removeStudentFromCourse,
} from '../service/courseService';
import { listStudents, createStudent } from '../../student/service/studentService';

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', studentNo: '', age: '' });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [c, s, sess] = await Promise.all([
          getCourse(courseId),
          listCourseStudents(courseId),
          listCourseSessions(courseId),
        ]);
        if (!mounted) return;
        setCourse(c);
        setStudents(s);
        setSessions(sess);
      } catch (err) {
        if (mounted) setError(err.response?.data?.error || '加载失败');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [courseId]);

  const handleSearch = async (term) => {
    setSearch(term);
    if (!term) {
      setOptions([]);
      return;
    }
    setSearching(true);
    try {
      const res = await listStudents(term);
      setOptions(res);
    } catch (err) {
      setError(err.response?.data?.error || '搜索失败');
    } finally {
      setSearching(false);
    }
  };

  const handleAddByOption = async (studentId) => {
    setError('');
    setActionMsg('');
    try {
      await addStudentToCourse(courseId, studentId);
      const updated = await listCourseStudents(courseId);
      setStudents(updated);
      setActionMsg('添加成功');
    } catch (err) {
      setError(err.response?.data?.error || '添加失败');
    }
  };

  const handleCreateAndAdd = async (e) => {
    e.preventDefault();
    setError('');
    setActionMsg('');
    try {
      const created = await createStudent({
        name: newStudent.name,
        studentNo: newStudent.studentNo || undefined,
        age: newStudent.age ? Number(newStudent.age) : undefined,
      });
      await addStudentToCourse(courseId, created.id);
      const updated = await listCourseStudents(courseId);
      setStudents(updated);
      setActionMsg('已创建并加入课程');
      setNewStudent({ name: '', studentNo: '', age: '' });
    } catch (err) {
      setError(err.response?.data?.error || '创建或添加失败');
    }
  };

  const handleRemoveStudent = async (studentId) => {
    setError('');
    setActionMsg('');
    try {
      await removeStudentFromCourse(courseId, studentId);
      const updated = await listCourseStudents(courseId);
      setStudents(updated);
      setActionMsg('已移除');
    } catch (err) {
      setError(err.response?.data?.error || '移除失败');
    }
  };

  if (loading) return <p>加载中…</p>;
  if (error) return <p style={{ color: '#b91c1c' }}>{error}</p>;
  if (!course) return <p>未找到课程</p>;

  return (
    <div className="page-card">
      <div className="page-header">
        <h2 className="page-title">{course.title}</h2>
        <Link className="button" to={`/courses/${course.id}/sessions/new`}>
          新增课次
        </Link>
      </div>
      <p style={{ margin: '8px 0' }}>地点：{course.location || '未填写'}</p>
      <p style={{ margin: '8px 0' }}>计划总课次：{course.total_planned_sessions}</p>

      <h3>学生名单</h3>
      <div className="form-field" style={{ marginBottom: 12 }}>
        <label>按姓名搜索并添加</label>
        <input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="输入学生姓名关键词"
        />
        {searching && <span style={{ color: '#64748b', fontSize: 12 }}>搜索中…</span>}
        {options.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0' }}>
            {options.map((opt) => (
              <li
                key={opt.id}
                style={{ padding: '8px', border: '1px solid #e2e8f0', borderRadius: 8, marginBottom: 6 }}
              >
                <div style={{ fontWeight: 700 }}>
                  {opt.name} {opt.student_no ? `(${opt.student_no})` : ''}
                </div>
                <div style={{ color: '#64748b', fontSize: 13 }}>
                  {opt.age != null ? `年龄: ${opt.age}` : '年龄未填'}
                </div>
                <button
                  className="button secondary"
                  type="button"
                  style={{ marginTop: 6 }}
                  onClick={() => handleAddByOption(opt.id)}
                >
                  添加到课程
                </button>
              </li>
            ))}
          </ul>
        ) : search && !searching ? (
          <div style={{ color: '#64748b', fontSize: 13, marginTop: 6 }}>无匹配学生</div>
        ) : null}
      </div>
      <div className="form-field" style={{ marginBottom: 12 }}>
        <label>新建学生并加入课程</label>
        <form onSubmit={handleCreateAndAdd} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            value={newStudent.name}
            onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
            placeholder="姓名"
            required
          />
          <input
            value={newStudent.studentNo}
            onChange={(e) => setNewStudent({ ...newStudent, studentNo: e.target.value })}
            placeholder="学号（可选）"
          />
          <input
            type="number"
            min="0"
            value={newStudent.age}
            onChange={(e) => setNewStudent({ ...newStudent, age: e.target.value })}
            placeholder="年龄（可选）"
          />
          <button className="button" type="submit">
            创建并加入
          </button>
        </form>
      </div>
      {actionMsg && <div style={{ color: '#16a34a', marginBottom: 8 }}>{actionMsg}</div>}
      {students.length === 0 ? (
        <p>暂无学生</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {students.map((s) => (
            <li key={s.id} style={{ padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                {s.name} {s.student_no ? `(${s.student_no})` : ''}
                {s.age != null ? ` · 年龄 ${s.age}` : ''}
              </div>
              <button
                className="button secondary"
                type="button"
                onClick={() => handleRemoveStudent(s.id)}
                style={{ marginTop: 6 }}
              >
                移除
              </button>
            </li>
          ))}
        </ul>
      )}

      <h3 style={{ marginTop: 24 }}>课次列表</h3>
      {sessions.length === 0 ? (
        <p>暂无课次</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {sessions.map((session) => (
            <li key={session.id} style={{ padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                {new Date(session.starts_at).toLocaleString()} — {new Date(session.ends_at).toLocaleTimeString()}
              </div>
              <div style={{ color: '#64748b', fontSize: 14 }}>
                状态：{session.status} · 地点：{session.location || course.location || '未填写'}
              </div>
              <Link className="button secondary" to={`/sessions/${session.id}/checkin`} style={{ marginTop: 8 }}>
                进入签到
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
