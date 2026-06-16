import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ScoreRing, StatusBadge, Spinner } from '../components/common';
import { useAuth } from '../context/AuthContext';

export default function InspectionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [inspection, setInspection] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [actioning, setActioning]   = useState(false);

  useEffect(() => {
    api.get(`/inspections/${id}`)
      .then(r => setInspection(r.data.data))
      .catch(() => navigate('/inspections'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAction(action) {
    setActioning(true);
    try {
      const { data } = await api.patch(`/inspections/${id}/${action}`);
      setInspection(prev => ({ ...prev, ...data.data }));
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao executar ação.');
    } finally {
      setActioning(false);
    }
  }

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={32} /></div>;
  if (!inspection) return null;

  // Group items by section
  const sections = {};
  (inspection.items || []).forEach(item => {
    if (!sections[item.section_code]) sections[item.section_code] = { name: item.section_name, items: [] };
    sections[item.section_code].items.push(item);
  });

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/inspections')}>← Voltar</button>
        <div style={{ flex:1 }}>
          <div className="page-title">{inspection.location_name}</div>
          <div className="page-sub">{inspection.inspection_date} · {inspection.inspector_name}</div>
        </div>
        <StatusBadge status={inspection.status} />
        {inspection.score_pct !== null && <ScoreRing pct={parseFloat(inspection.score_pct)} size={56} />}
      </div>

      {/* Actions */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
        {['pending','in_progress'].includes(inspection.status) && user.id === inspection.inspector_id && (
          <button className="btn btn-primary btn-sm" onClick={() => navigate(`/inspections/${id}/edit`)}>
            ✏️ Preencher Checklist
          </button>
        )}
        {inspection.status === 'in_progress' && user.id === inspection.inspector_id && (
          <button className="btn btn-success btn-sm" disabled={actioning} onClick={() => handleAction('submit')}>
            ✅ Submeter Inspeção
          </button>
        )}
        {inspection.status === 'submitted' && hasRole('admin','ceo','supervisor') && (
          <button className="btn btn-primary btn-sm" disabled={actioning} onClick={() => handleAction('review')}>
            👁 Marcar como Revisada
          </button>
        )}
        {inspection.status === 'reviewed' && hasRole('admin','ceo') && (
          <button className="btn btn-secondary btn-sm" disabled={actioning} onClick={() => handleAction('close')}>
            🔒 Fechar Inspeção
          </button>
        )}
      </div>

      {/* Info card */}
      <div className="card" style={{ marginBottom:16 }}>
        <div className="two-col" style={{ gap:24 }}>
          <div>
            <div style={{ fontSize:11, color:'#aaa', marginBottom:4, textTransform:'uppercase', letterSpacing:0.8 }}>Inspetor</div>
            <div style={{ fontSize:14, fontWeight:500 }}>{inspection.inspector_name}</div>
          </div>
          <div>
            <div style={{ fontSize:11, color:'#aaa', marginBottom:4, textTransform:'uppercase', letterSpacing:0.8 }}>Supervisor</div>
            <div style={{ fontSize:14 }}>{inspection.supervisor_name || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize:11, color:'#aaa', marginBottom:4, textTransform:'uppercase', letterSpacing:0.8 }}>Data</div>
            <div style={{ fontSize:14 }}>{inspection.inspection_date}</div>
          </div>
          <div>
            <div style={{ fontSize:11, color:'#aaa', marginBottom:4, textTransform:'uppercase', letterSpacing:0.8 }}>Nível de Alerta</div>
            <StatusBadge status={inspection.alert_level || 'ok'} />
          </div>
        </div>
        {inspection.notes && (
          <div style={{ marginTop:16, paddingTop:16, borderTop:'0.5px solid rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize:11, color:'#aaa', marginBottom:4 }}>NOTAS</div>
            <div style={{ fontSize:13, color:'#444' }}>{inspection.notes}</div>
          </div>
        )}
      </div>

      {/* Checklist sections */}
      {Object.entries(sections).map(([code, section]) => (
        <div key={code} className="card" style={{ marginBottom:12 }}>
          <div style={{ fontSize:14, fontWeight:600, marginBottom:12, color:'#1E2A3A' }}>{section.name}</div>
          {section.items.map(item => (
            <div key={item.id} className={`checklist-item${item.score !== null ? ' scored' : ''}`}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
                <div style={{ fontSize:13, color:'#2C2C2A', flex:1 }}>{item.text}</div>
                <div style={{ display:'flex', gap:4, flexShrink:0 }}>
                  {[1,2,3,4,5].map(n => (
                    <div key={n} style={{
                      width:28, height:28, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:12, fontWeight:600,
                      background: item.score === n ? ['','#A32D2D','#993C1D','#BA7517','#3B6D11','#0F6E56'][n] : '#F0F0F0',
                      color: item.score === n ? '#fff' : '#aaa',
                    }}>{n}</div>
                  ))}
                </div>
              </div>
              {item.comment && (
                <div style={{ fontSize:12, color:'#888', marginTop:6, paddingTop:6, borderTop:'0.5px solid rgba(0,0,0,0.06)' }}>
                  💬 {item.comment}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
