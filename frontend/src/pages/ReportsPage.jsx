import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ScoreRing, StatusBadge, Spinner, EmptyState, ProgressBar } from '../components/common';

function scoreColor(pct) {
  if (pct >= 90) return '#0F6E56';
  if (pct >= 75) return '#3B6D11';
  if (pct >= 60) return '#BA7517';
  if (pct >= 40) return '#993C1D';
  return '#A32D2D';
}

export default function ReportsPage() {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filters, setFilters]         = useState({ location_id: '', from: '', to: '', status: '' });
  const [locations, setLocations]     = useState([]);

  useEffect(() => {
    api.get('/locations').then(r => setLocations(r.data.data || []));
    loadData();
  }, []);

  function loadData() {
    setLoading(true);
    const p = new URLSearchParams();
    if (filters.location_id) p.set('location_id', filters.location_id);
    if (filters.from)        p.set('from', filters.from);
    if (filters.to)          p.set('to', filters.to);
    if (filters.status)      p.set('status', filters.status);
    api.get(`/inspections?${p}`)
      .then(r => setInspections(r.data.data || []))
      .finally(() => setLoading(false));
  }

  const withScore  = inspections.filter(i => i.score_pct !== null);
  const avgScore   = withScore.length ? Math.round(withScore.reduce((s, i) => s + parseFloat(i.score_pct), 0) / withScore.length) : null;
  const critical   = withScore.filter(i => i.alert_level === 'critical').length;
  const warning    = withScore.filter(i => i.alert_level === 'warning').length;

  // Group by location for summary
  const byLocation = {};
  withScore.forEach(i => {
    if (!byLocation[i.location_name]) byLocation[i.location_name] = { scores: [], count: 0 };
    byLocation[i.location_name].scores.push(parseFloat(i.score_pct));
    byLocation[i.location_name].count++;
  });
  const locationSummary = Object.entries(byLocation)
    .map(([name, d]) => ({ name, avg: Math.round(d.scores.reduce((a,b) => a+b,0)/d.scores.length), count: d.count }))
    .sort((a,b) => b.avg - a.avg);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Relatórios</div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom:16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12, alignItems:'flex-end' }}>
          <div>
            <label className="form-label">Localização</label>
            <select className="form-select" value={filters.location_id} onChange={e => setFilters(p=>({...p,location_id:e.target.value}))}>
              <option value="">Todas</option>
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Estado</label>
            <select className="form-select" value={filters.status} onChange={e => setFilters(p=>({...p,status:e.target.value}))}>
              <option value="">Todos</option>
              <option value="submitted">Submetida</option>
              <option value="reviewed">Revisada</option>
              <option value="closed">Fechada</option>
            </select>
          </div>
          <div>
            <label className="form-label">De</label>
            <input className="form-input" type="date" value={filters.from} onChange={e => setFilters(p=>({...p,from:e.target.value}))} />
          </div>
          <div>
            <label className="form-label">Até</label>
            <input className="form-input" type="date" value={filters.to} onChange={e => setFilters(p=>({...p,to:e.target.value}))} />
          </div>
          <button className="btn btn-primary" onClick={loadData}>Filtrar</button>
        </div>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={32} /></div>
      ) : (
        <>
          {/* KPIs */}
          <div className="metric-grid" style={{ marginBottom:16 }}>
            <div className="metric-card">
              <div className="metric-label">Total Inspeções</div>
              <div className="metric-value">{inspections.length}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Score Médio</div>
              <div className="metric-value" style={{ color: avgScore ? scoreColor(avgScore) : '#aaa' }}>
                {avgScore !== null ? `${avgScore}%` : '—'}
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Críticos</div>
              <div className="metric-value" style={{ color: critical > 0 ? '#A32D2D' : '#0F6E56' }}>{critical}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Avisos</div>
              <div className="metric-value" style={{ color: warning > 0 ? '#BA7517' : '#0F6E56' }}>{warning}</div>
            </div>
          </div>

          <div className="two-col" style={{ marginBottom:16 }}>
            {/* By location */}
            <div className="card">
              <div style={{ fontSize:13, fontWeight:500, marginBottom:14 }}>Performance por Localização</div>
              {locationSummary.length === 0 ? (
                <EmptyState message="Sem dados suficientes." icon="📊" />
              ) : locationSummary.map((l,i) => (
                <div key={i} style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <span style={{ fontSize:12, color:'#444' }}>{l.name}</span>
                    <span style={{ fontSize:12, fontWeight:500, color:scoreColor(l.avg) }}>{l.avg}% <span style={{ color:'#aaa', fontWeight:400 }}>({l.count})</span></span>
                  </div>
                  <ProgressBar value={l.avg} />
                </div>
              ))}
            </div>

            {/* Score distribution */}
            <div className="card">
              <div style={{ fontSize:13, fontWeight:500, marginBottom:14 }}>Distribuição de Scores</div>
              {[
                { label:'Excelente (90–100%)', min:90, color:'#0F6E56' },
                { label:'Bom (75–89%)',        min:75, max:90, color:'#3B6D11' },
                { label:'Médio (60–74%)',      min:60, max:75, color:'#BA7517' },
                { label:'Deficiente (40–59%)', min:40, max:60, color:'#993C1D' },
                { label:'Mau (< 40%)',         max:40, color:'#A32D2D' },
              ].map(band => {
                const count = withScore.filter(i => {
                  const p = parseFloat(i.score_pct);
                  return (band.min === undefined || p >= band.min) && (band.max === undefined || p < band.max);
                }).length;
                const pct = withScore.length ? Math.round((count/withScore.length)*100) : 0;
                return (
                  <div key={band.label} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                    <div style={{ width:12, height:12, borderRadius:3, background:band.color, flexShrink:0 }} />
                    <div style={{ flex:1, fontSize:12, color:'#444' }}>{band.label}</div>
                    <div style={{ fontSize:12, fontWeight:600, color:band.color, width:48, textAlign:'right' }}>{count} ({pct}%)</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Full table */}
          {inspections.length === 0 ? (
            <EmptyState message="Nenhuma inspeção encontrada com estes filtros." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Local</th><th>Inspetor</th><th>Data</th><th>Score</th><th>Alerta</th><th>Estado</th></tr>
                </thead>
                <tbody>
                  {inspections.map(i => (
                    <tr key={i.id} style={{ cursor:'pointer' }} onClick={() => navigate(`/inspections/${i.id}`)}>
                      <td style={{ fontWeight:500 }}>{i.location_name}</td>
                      <td style={{ color:'#888' }}>{i.inspector_name}</td>
                      <td style={{ color:'#888' }}>{i.inspection_date}</td>
                      <td><ScoreRing pct={i.score_pct !== null ? parseFloat(i.score_pct) : null} size={40} /></td>
                      <td>{i.score_pct !== null && <StatusBadge status={i.alert_level} />}</td>
                      <td><StatusBadge status={i.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
