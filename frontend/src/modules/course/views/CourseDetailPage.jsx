import React, { useEffect, useState } from 'react';
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
        if (mounted) setError(err.response?.data?.error || '加载课程详情失败');
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
      setSearch('');
      setOptions([]);
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
      setActionMsg('已从课程中移除');
    } catch (err) {
      setError(err.response?.data?.error || '移除失败');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-400 text-sm font-medium">加载课程详情...</p>
    </div>
  );

  if (error && !course) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8FAFC]">
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 text-center max-w-sm">
        <p className="text-rose-500 font-bold mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">重试</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 font-sans antialiased">
      {/* Sticky Header */}
      <div className="bg-white/80 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/courses" className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-slate-50 rounded-full transition-all">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-lg font-black text-slate-900 truncate px-4">{course?.title}</h1>
          <Link 
            to={`/courses/${courseId}/sessions/new`}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            新增课次
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-8 space-y-8">
        {/* Course Info Summary */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">上课地点</p>
                  <p className="text-sm font-bold text-slate-900">{course.location || '未填写地点'}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">计划总课次</p>
                  <p className="text-sm font-bold text-slate-900">{course.total_planned_sessions} 节课</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Students Section */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between px-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">学生名单 ({students.length})</h3>
            {actionMsg && <span className="text-[10px] font-bold text-emerald-500 animate-pulse">{actionMsg}</span>}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Search & Add Form */}
            <div className="lg:col-span-1 space-y-6">
              {/* Search Box */}
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">快速查找添加</p>
                <div className="relative group">
                  <input
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="输入学生姓名关键词"
                    className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-xs font-medium outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                  />
                  {searching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-3 h-3 border-2 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>

                {/* Search Results */}
                {options.length > 0 && (
                  <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-1">
                    {options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleAddByOption(opt.id)}
                        className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50 rounded-xl transition-all group"
                      >
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-900">{opt.name}</p>
                          <p className="text-[10px] text-slate-400">{opt.student_no || '无学号'}</p>
                        </div>
                        <svg className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                      </button>
                    ))}
                  </div>
                )}
                {search && !searching && options.length === 0 && (
                  <p className="mt-4 text-center text-[10px] font-bold text-slate-400 italic">无匹配结果</p>
                )}
              </div>

              {/* Quick Create Form */}
              <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">新建并加入</p>
                <form onSubmit={handleCreateAndAdd} className="space-y-3">
                  <input
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    placeholder="姓名"
                    required
                    className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-xs font-medium outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                  />
                  <input
                    value={newStudent.studentNo}
                    onChange={(e) => setNewStudent({ ...newStudent, studentNo: e.target.value })}
                    placeholder="学号 (可选)"
                    className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-xs font-medium outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                  />
                  <input
                    type="number"
                    min="0"
                    value={newStudent.age}
                    onChange={(e) => setNewStudent({ ...newStudent, age: e.target.value })}
                    placeholder="年龄 (可选)"
                    className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 text-xs font-medium outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                  />
                  <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 mt-2">
                    创建加入
                  </button>
                </form>
              </div>
            </div>

            {/* Right: Student List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                {students.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                    <p className="text-slate-400 text-sm font-bold">暂无学生加入此课程</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {students.map((s) => (
                      <div key={s.id} className="p-5 flex items-center justify-between group hover:bg-slate-50/50 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-indigo-500 transition-all">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">{s.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                              {s.student_no ? `学号: ${s.student_no}` : '无学号'} {s.age != null && ` · 年龄 ${s.age}`}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveStudent(s.id)}
                          className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Sessions Section */}
        <section className="space-y-4">
          <div className="flex items-baseline justify-between px-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">课次排表 ({sessions.length})</h3>
          </div>

          {sessions.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-100 rounded-[2.5rem] p-12 text-center">
              <p className="text-slate-400 text-sm font-bold">尚未安排任何课次</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessions.map((session) => (
                <div key={session.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-all">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="bg-slate-50 px-3 py-1 rounded-full">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{session.status}</span>
                      </div>
                      <div className="text-right">
                         <p className="text-xs font-black text-slate-900">
                           {new Date(session.starts_at).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                         </p>
                         <p className="text-[10px] font-bold text-slate-400">
                           {new Date(session.starts_at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                         </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-slate-500">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                      <span className="text-xs font-medium">{session.location || course.location || '未填写'}</span>
                    </div>
                  </div>

                  <Link 
                    to={`/sessions/${session.id}/checkin`}
                    className="mt-6 w-full py-3 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center transition-all active:scale-[0.98]"
                  >
                    进入签到详情
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-in { animation-duration: 400ms; animation-fill-mode: forwards; }
        .fade-in { animation-name: fade-in; }
      `}} />
    </div>
  );
}
