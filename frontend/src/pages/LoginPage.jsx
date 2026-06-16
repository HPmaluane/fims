import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const demoUsers = [
    { label: 'Admin',      email: 'admin@fims.co.mz' },
    { label: 'CEO',        email: 'ceo@fims.co.mz' },
    { label: 'Supervisor', email: 'supervisor@fims.co.mz' },
    { label: 'Inspetor',   email: 'inspector1@fims.co.mz' },
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Preencha todos os campos.'); return; }
    setLoading(true); setError('');
    try {
      await login(form.email, form.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
	setError(err?.response?.data?.message || err.message || 'Erro ao iniciar sessão.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div style={{ width: '100%', maxWidth: 420, padding: '0 20px' }}>
        <div className="login-card">
          <div className="login-logo">FIMS</div>
          <div className="login-sub">Facility Inspection Management System</div>

          {error && (
            <div style={{ background: '#FCEBEB', color: '#A32D2D', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="utilizador@fims.co.mz"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                disabled={loading}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                disabled={loading}
              />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px', marginTop: 4 }} disabled={loading}>
              {loading ? <span className="spinner" style={{ borderTopColor:'#fff' }} /> : 'Entrar'}
            </button>
          </form>

          <div style={{ marginTop: 24, borderTop: '0.5px solid rgba(0,0,0,0.08)', paddingTop: 20 }}>
            <div style={{ fontSize: 11, color: '#aaa', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 }}>Acesso Rápido (Demo)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {demoUsers.map(u => (
                <button key={u.email}
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ justifyContent: 'center', fontSize: 11 }}
                  onClick={() => setForm({ email: u.email, password: 'Fims@2024' })}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/')}
            style={{ marginTop: 16, background: 'none', border: 'none', color: '#aaa', fontSize: 12, cursor: 'pointer', width: '100%', textAlign: 'center' }}
          >
            ← Voltar ao início
          </button>
        </div>
      </div>
    </div>
  );
}
