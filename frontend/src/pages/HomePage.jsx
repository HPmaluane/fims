import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  const features = [
    { icon: '🔍', title: 'Inspeções Estruturadas', desc: 'Checklists padronizadas por secção: Pessoal, Gabinetes, Copas e Casas de Banho.' },
    { icon: '📊', title: 'Dashboard em Tempo Real', desc: 'Scores, tendências mensais e alertas críticos visíveis de imediato.' },
    { icon: '👥', title: 'Gestão por Perfis', desc: 'Acesso diferenciado para Admin, CEO, Supervisor e Inspetor.' },
    { icon: '🚨', title: 'Sistema de Alertas', desc: 'Notificações automáticas para inspeções críticas (score < 60%).' },
    { icon: '📄', title: 'Relatórios Detalhados', desc: 'Histórico completo por local, inspetor e período.' },
    { icon: '🔒', title: 'Segurança Total', desc: 'JWT + Refresh Tokens, hash de passwords, auditoria de ações.' },
  ];

  const stats = [
    { value: '6+', label: 'Localizações' },
    { value: '36', label: 'Itens de Checklist' },
    { value: '4',  label: 'Perfis de Acesso' },
    { value: '100%', label: 'Seguro' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F8F7F4' }}>
      {/* NAV */}
      <nav style={{ background: '#1E2A3A', padding: '0 40px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ color: '#fff', fontWeight: 700, fontSize: 18, letterSpacing: -0.5 }}>
          FIMS <span style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.45)', marginLeft: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Facility Inspection Mgmt</span>
        </div>
        <button
          onClick={() => navigate('/login')}
          style={{ background: '#fff', color: '#1E2A3A', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
        >
          Entrar
        </button>
      </nav>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #1E2A3A 0%, #2d4060 60%, #1a3a50 100%)', color: '#fff', padding: '80px 40px 100px', textAlign: 'center' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', borderRadius: 20, padding: '4px 14px', fontSize: 12, marginBottom: 24, color: 'rgba(255,255,255,0.8)', letterSpacing: 1, textTransform: 'uppercase' }}>
            Sistema Profissional de Inspeções
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 700, lineHeight: 1.15, marginBottom: 20, letterSpacing: -1 }}>
            Gestão de Inspeções<br />
            <span style={{ color: '#5BAFF5' }}>Inteligente e Eficiente</span>
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: 36 }}>
            O FIMS centraliza todas as inspeções de limpeza e manutenção das suas instalações. 
            Acompanhe scores, gira equipas e tome decisões baseadas em dados reais.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/login')}
              style={{ background: '#378ADD', color: '#fff', border: 'none', borderRadius: 10, padding: '14px 32px', fontWeight: 600, fontSize: 15, cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseOver={e => e.target.style.background = '#2870c0'}
              onMouseOut={e => e.target.style.background = '#378ADD'}
            >
              Entrar no Sistema →
            </button>
            <button
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, padding: '14px 32px', fontWeight: 500, fontSize: 15, cursor: 'pointer' }}
            >
              Saber Mais
            </button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: '#fff', borderBottom: '0.5px solid rgba(0,0,0,0.08)', padding: '32px 40px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 24, textAlign: 'center' }}>
          {stats.map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#1E2A3A' }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: '72px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: '#1A1A18', marginBottom: 12 }}>Funcionalidades Principais</h2>
          <p style={{ fontSize: 15, color: '#888', maxWidth: 500, margin: '0 auto' }}>Tudo o que precisa para gerir inspeções de forma profissional e eficaz.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {features.map(f => (
            <div key={f.title} style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,0.09)', borderRadius: 14, padding: 24, transition: 'box-shadow 0.2s' }}
              onMouseOver={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'}
              onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1A18', marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CREDENTIALS */}
      <section style={{ background: '#1E2A3A', color: '#fff', padding: '56px 40px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 12 }}>Credenciais de Demonstração</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 32 }}>Password universal: <strong style={{ color:'#5BAFF5' }}>Fims@2024</strong></p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            {[
              { role: 'Admin',      email: 'admin@fims.co.mz' },
              { role: 'CEO',        email: 'ceo@fims.co.mz' },
              { role: 'Supervisor', email: 'supervisor@fims.co.mz' },
              { role: 'Inspetor',   email: 'inspector1@fims.co.mz' },
            ].map(u => (
              <div key={u.role} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: '16px 20px', textAlign: 'left' }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{u.role}</div>
                <div style={{ fontSize: 13, color: '#5BAFF5', wordBreak: 'break-all' }}>{u.email}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/login')}
            style={{ marginTop: 36, background: '#378ADD', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 32px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
          >
            Aceder ao Sistema →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#111', color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '20px 40px', fontSize: 12 }}>
        © {new Date().getFullYear()} FIMS – Facility Inspection Management System. Todos os direitos reservados.
      </footer>
    </div>
  );
}
