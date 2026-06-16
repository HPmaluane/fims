import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ScoreRing, StatusBadge, MiniBarChart, Spinner, ProgressBar } from '../components/common';

function scoreLabel(pct) {
  if (pct >= 90) return { label: 'Excelente', color: '#0F6E56' };
  if (pct >= 75) return { label: 'Acima da Média', color: '#3B6D11' };
  if (pct >= 60) return { label: 'Média', color: '#BA7517' };
  if (pct >= 40) return { label: 'Deficiente', color: '#993C1D' };
  return { label: 'Mau', color: '#A32D2D' };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (['admin', 'ceo', 'supervisor'].includes(user.role)) {
      api.get('/dashboard').then(r => setData(r.data.data)).catch(console.error).finally(() => setLoading(false));
    } else {
      api.get('/inspections').then(r => setData(r.data.data)).catch(console.error).finally(() => setLoading(false));
    }
  }, [user.role]);

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding: 60 }}><Spinner size={32} /></div>;

  if (user.role === 'inspector') return <InspectorDashboard inspections={data || []} navigate={navigate} />;
  return <AdminDashboard data={data} navigate={navigate} />;
}

function AdminDashboard({ data, navigate }) {
  if (!data) return null;
  const { totals, byStatus = [], byLocation = [], byMonth = [], alerts = [] } = data;

  const monthChart = byMonth.map(m => ({
    label: m.month?.slice(5) || '',
    value: parseFloat(m.avg_score) || 0,
  }));

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-sub">Visão geral do sistema</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/inspections/new')}>+ Nova Inspeção</button>
      </div>

      {parseInt(totals?.critical) > 0 && (
        <div className="alert-bar alert-critical">
          ⚠️ <strong>{totals.critical} inspeção(ões) crítica(s)</strong> requerem atenção imediata. Score abaixo de 60%.
        </div>
      )}

      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-label">Score Médio Global</div>
          <div className="metric-value" style={{ color: scoreLabel(parseFloat(totals?.avg_score) || 0).color }}>
            {totals?.avg_score ? `${totals.avg_score}%` : '—'}
          </div>
          <div className="metric-sub">{scoreLabel(parseFloat(totals?.avg_score) || 0).label}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Total Inspeções</div>
          <div className="metric-value">{totals?.total || 0}</div>
          <div className="metric-sub">Todas as inspeções</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Alertas Críticos</div>
          <div className="metric-value" style={{ color: parseInt(totals?.critical) > 0 ? '#A32D2D' : '#3B6D11' }}>
            {totals?.critical || 0}
          </div>
          <div className="metric-sub">{totals?.warning || 0} avisos</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Localizações</div>
          <div className="metric-value">{byLocation.length}</div>
          <div className="metric-sub">Com dados</div>
        </div>
      </div>

      <div className="two-col" style={{ marginBottom: 16 }}>
        <div className="card">
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Performance por Localização</div>
          {byLocation.slice(0, 6).map((loc, i) => {
            const pct = parseFloat(loc.avg_score) || 0;
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                <div style={{ fontSize:12, width:130, color:'#444', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{loc.name}</div>
                <div style={{ flex:1 }}><ProgressBar value={pct} /></div>
                <div style={{ fontSize:12, fontWeight:500, color:scoreLabel(pct).color, width:36, textAlign:'right' }}>{pct}%</div>
              </div>
            );
          })}
        </div>
        <div className="card">
          <div style={{ fontSize:13, fontWeight:500, marginBottom:4 }}>Tendência Mensal</div>
          <div style={{ fontSize:11, color:'#888', marginBottom:8 }}>Score médio por mês</div>
          <MiniBarChart data={monthChart} height={140} />
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="card">
          <div style={{ fontSize:13, fontWeight:500, marginBottom:12 }}>Inspeções com Alertas Críticos</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Local</th><th>Inspetor</th><th>Data</th><th>Score</th><th>Nível</th></tr></thead>
              <tbody>
                {alerts.map(i => (
                  <tr key={i.id} style={{ cursor:'pointer' }} onClick={() => navigate(`/inspections/${i.id}`)}>
                    <td style={{ fontWeight:500 }}>{i.location_name}</td>
                    <td style={{ color:'#888' }}>{i.inspector_name}</td>
                    <td style={{ color:'#888' }}>{i.inspection_date}</td>
                    <td><ScoreRing pct={parseFloat(i.score_pct)} size={40} /></td>
                    <td><StatusBadge status={i.alert_level} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function InspectorDashboard({ inspections, navigate }) {
  const pending    = inspections.filter(i => i.status === 'pending');
  const inProgress = inspections.filter(i => i.status === 'in_progress');
  const submitted  = inspections.filter(i => ['submitted','reviewed','closed'].includes(i.status));

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-sub">As minhas inspeções</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/inspections/new')}>+ Nova Inspeção</button>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-label">Pendentes</div>
          <div className="metric-value" style={{ color:'#185FA5' }}>{pending.length}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Em Progresso</div>
          <div className="metric-value" style={{ color:'#534AB7' }}>{inProgress.length}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Concluídas</div>
          <div className="metric-value" style={{ color:'#0F6E56' }}>{submitted.length}</div>
        </div>
      </div>

      {[...pending, ...inProgress].length > 0 && (
        <div className="card" style={{ marginBottom:16 }}>
          <div style={{ fontSize:13, fontWeight:500, marginBottom:12 }}>A Fazer</div>
          {[...pending, ...inProgress].map(i => (
            <div key={i.id} onClick={() => navigate(`/inspections/${i.id}/edit`)}
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:'0.5px solid rgba(0,0,0,0.06)', cursor:'pointer' }}>
              <div>
                <div style={{ fontSize:13, fontWeight:500 }}>{i.location_name}</div>
                <div style={{ fontSize:11, color:'#888' }}>{i.inspection_date}</div>
              </div>
              <StatusBadge status={i.status} />
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div style={{ fontSize:13, fontWeight:500, marginBottom:12 }}>Histórico Recente</div>
        {submitted.length === 0 ? (
          <div style={{ fontSize:13, color:'#aaa', textAlign:'center', padding:24 }}>Nenhuma inspeção concluída ainda.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Local</th><th>Data</th><th>Score</th><th>Estado</th></tr></thead>
              <tbody>
                {submitted.slice(0, 10).map(i => (
                  <tr key={i.id} style={{ cursor:'pointer' }} onClick={() => navigate(`/inspections/${i.id}`)}>
                    <td style={{ fontWeight:500 }}>{i.location_name}</td>
                    <td style={{ color:'#888' }}>{i.inspection_date}</td>
                    <td><ScoreRing pct={i.score_pct ? parseFloat(i.score_pct) : null} size={40} /></td>
                    <td><StatusBadge status={i.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
