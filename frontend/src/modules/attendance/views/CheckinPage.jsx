import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSessionDetail, openSession, saveAttendance, closeSession } from '../../session/service/sessionService';
import { listCourseStudents } from '../../course/service/courseService';

const statusOptions = [
  { value: 'present', label: '出勤', color: 'emerald' },
  { value: 'late', label: '迟到', color: 'orange' },
  { value: 'leave', label: '请假', color: 'blue' },
  { value: 'absent', label: '缺勤', color: 'rose' },
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
      setError(err.response?.data?.error || '加载数据失败');
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
    setError('');
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
      setToast('签到已成功保存并结课');
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      setError(err.response?.data?.error || '保存签到失败');
      setSaving(false);
    }
  };

  const handleOpen = async () => {
    try {
      await openSession(sessionId);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || '无法开始课次');
    }
  };

  const handleClose = async () => {
    try {
      await closeSession(sessionId);
      await load();
    } catch (err) {
      setError(err.response?.data?.error || '无法关闭课次');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
      <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-400 text-sm font-medium">准备签到表...</p>
    </div>
  );

  if (error && !records.length) return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8FAFC]">
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 text-center max-w-sm">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <p className="text-slate-900 font-bold mb-2">出错了</p>
        <p className="text-slate-500 text-sm mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold active:scale-95 transition-all">重试</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 font-sans antialiased">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-slate-50 rounded-full transition-all">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="text-center flex-1 px-4">
            <h1 className="text-lg font-black text-slate-900 truncate">签到 · {session?.course_title || session?.title}</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {session?.status === 'open' ? '🟢 授课中' : session?.status === 'completed' ? '⚪️ 已结课' : '🔵 未开始'}
            </p>
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 pt-8">
        {/* Session Info Card */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 mb-8">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-sm font-bold">
                  {new Date(session.starts_at).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                <span className="text-sm font-medium">{session.location || '待定地点'}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              {session.status === 'scheduled' && (
                <button onClick={handleOpen} className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-600 hover:text-white transition-all">
                  开始上课
                </button>
              )}
              {session.status === 'open' && (
                <button onClick={handleClose} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-rose-50 hover:text-rose-600 transition-all">
                  提前结课
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">学生考勤表 ({records.length})</h3>
            {error && <span className="text-xs font-bold text-rose-500">{error}</span>}
          </div>

          {records.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-100 rounded-[2.5rem] p-12 text-center">
              <p className="text-slate-400 text-sm font-medium">课程中尚未添加学生</p>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((r) => (
                <div key={r.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900">{r.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{r.student_no || '暂无学号'}</p>
                      </div>
                    </div>

                    {/* Status Toggle (iOS Style Segmented Control) */}
                    <div className="bg-slate-100 p-1 rounded-2xl flex w-full md:w-auto overflow-hidden">
                      {statusOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleStatusChange(r.student_id, opt.value)}
                          className={`flex-1 md:flex-none md:px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                            r.status === opt.value 
                            ? `bg-white text-${opt.color}-600 shadow-sm` 
                            : 'text-slate-400 hover:text-slate-600'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Note Input */}
                  <div className="mt-4 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      <input
                        value={r.note || ''}
                        onChange={(e) => handleNoteChange(r.student_id, e.target.value)}
                        placeholder="添加备注（如：身体不适、迟到原因...）"
                        className="flex-1 bg-transparent text-xs font-medium text-slate-600 outline-none placeholder:text-slate-300"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC] to-transparent z-50">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={handleSave}
            disabled={saving || records.length === 0}
            className={`w-full py-5 rounded-[2rem] text-sm font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${
              saving 
              ? 'bg-slate-400 text-white cursor-not-allowed' 
              : 'bg-slate-900 text-white hover:bg-black'
            }`}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                保存中...
              </>
            ) : (
              '确认并保存签到'
            )}
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            <span className="text-sm font-black">{toast}</span>
          </div>
        </div>
      )}

      {/* Tailwind Specific Colors helper (forcing compilers to include used colors) */}
      <div className="hidden text-emerald-600 text-orange-600 text-blue-600 text-rose-600 bg-emerald-50 bg-orange-50 bg-blue-50 bg-rose-50"></div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slide-in-from-top-4 { from { transform: translate(-50%, -16px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
        .animate-in { animation-duration: 400ms; animation-fill-mode: forwards; }
        .fade-in { animation-name: fade-in; }
        .slide-in-from-top-4 { animation-name: slide-in-from-top-4; }
      `}} />
    </div>
  );
}