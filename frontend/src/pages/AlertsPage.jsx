// ─── ALERTS PAGE ────────────────────────────────────────────
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ScoreRing, StatusBadge, Spinner, EmptyState } from '../components/common';

export function AlertsPage() {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/inspections').then(r => setInspections(r.data.data || [])).finally(() => setLoading(false));
  }, []);

  const critical = inspections.filter(i => i.alert_level === 'critical' && i.score_pct !== null);
  const warning  = inspections.filter(i => i.alert_level === 'warning'  && i.score_pct !== null);

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={32} /></div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Alertas</div>
      </div>

      {critical.length === 0 && warning.length === 0 && (
        <EmptyState message="Sem alertas activos. Todas as inspeções estão dentro dos parâmetros." icon="✅" />
      )}

      {critical.length > 0 && (
        <>
          <div className="alert-bar alert-critical">⚠️ <strong>{critical.length} inspeção(ões) crítica(s)</strong> — Score abaixo de 60%</div>
          <InspectionTable items={critical} navigate={navigate} />
        </>
      )}

      {warning.length > 0 && (
        <>
          <div className="alert-bar alert-warning" style={{ marginTop:16 }}>🔔 <strong>{warning.length} aviso(s)</strong> — Score entre 60% e 75%</div>
          <InspectionTable items={warning} navigate={navigate} />
        </>
      )}
    </div>
  );
}

function InspectionTable({ items, navigate }) {
  return (
    <div className="table-wrap" style={{ marginBottom:16 }}>
      <table>
        <thead><tr><th>Local</th><th>Inspetor</th><th>Data</th><th>Score</th><th>Estado</th></tr></thead>
        <tbody>
          {items.map(i => (
            <tr key={i.id} style={{ cursor:'pointer' }} onClick={() => navigate(`/inspections/${i.id}`)}>
              <td style={{ fontWeight:500 }}>{i.location_name}</td>
              <td style={{ color:'#888' }}>{i.inspector_name}</td>
              <td style={{ color:'#888' }}>{i.inspection_date}</td>
              <td><ScoreRing pct={parseFloat(i.score_pct)} size={40} /></td>
              <td><StatusBadge status={i.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AlertsPage;
