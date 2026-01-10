import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../service/authService';

export default function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await register({ email: form.email, password: form.password, name: form.name });
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || '提交失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '60px auto' }} className="page-card">
      <div className="page-header">
        <h2 className="page-title">{mode === 'login' ? '登录' : '注册'}</h2>
        <button
          className="button secondary"
          type="button"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setError('');
          }}
        >
          切换到{mode === 'login' ? '注册' : '登录'}
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <div className="form-field">
            <label>姓名</label>
            <input value={form.name} onChange={handleChange('name')} placeholder="请输入姓名" required />
          </div>
        )}
        <div className="form-field">
          <label>邮箱</label>
          <input type="email" value={form.email} onChange={handleChange('email')} placeholder="请输入邮箱" required />
        </div>
        <div className="form-field">
          <label>密码</label>
          <input
            type="password"
            value={form.password}
            onChange={handleChange('password')}
            placeholder="至少6位"
            required
          />
        </div>
        {error && <div style={{ color: '#b91c1c', marginBottom: 12 }}>{error}</div>}
        <button className="button" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
          {loading ? '提交中…' : mode === 'login' ? '登录' : '注册并登录'}
        </button>
      </form>
    </div>
  );
}
