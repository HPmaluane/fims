import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { ScoreRing, StatusBadge, Spinner, EmptyState } from '../components/common';
import { useAuth } from '../context/AuthContext';

export default function InspectionsPage() {
  const navigate = useNavigate();
  const { user }  = useAuth();
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState({ status: '', search: '' });

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter.status) params.set('status', filter.status);
    api.get(`/inspections?${params}`)
      .then(r => setInspections(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter.status]);

  const filtered = inspections.filter(i =>
    !filter.search ||
    i.location_name?.toLowerCase().includes(filter.search.toLowerCase()) ||
    i.inspector_name?.toLowerCase().includes(filter.search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Inspeções</div>
          <div className="page-sub">{filtered.length} inspeções encontradas</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/inspections/new')}>+ Nova Inspeção</button>
      </div>

      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        <input
          className="form-input"
          placeholder="Pesquisar por local ou inspetor..."
          style={{ maxWidth: 280 }}
          value={filter.search}
          onChange={e => setFilter(p => ({ ...p, search: e.target.value }))}
        />
        <select
          className="form-select"
          style={{ maxWidth: 180 }}
          value={filter.status}
          onChange={e => setFilter(p => ({ ...p, status: e.target.value }))}
        >
          <option value="">Todos os estados</option>
          <option value="pending">Pendente</option>
          <option value="in_progress">Em Progresso</option>
          <option value="submitted">Submetida</option>
          <option value="reviewed">Revisada</option>
          <option value="closed">Fechada</option>
        </select>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={32} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState message="Nenhuma inspeção encontrada." />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Localização</th>
                <th>Inspetor</th>
                <th>Data</th>
                <th>Score</th>
                <th>Estado</th>
                <th>Alerta</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(i => (
                <tr key={i.id} style={{ cursor:'pointer' }} onClick={() => navigate(`/inspections/${i.id}`)}>
                  <td style={{ fontWeight:500 }}>{i.location_name}</td>
                  <td style={{ color:'#888' }}>{i.inspector_name}</td>
                  <td style={{ color:'#888' }}>{i.inspection_date}</td>
                  <td><ScoreRing pct={i.score_pct !== null ? parseFloat(i.score_pct) : null} size={40} /></td>
                  <td><StatusBadge status={i.status} /></td>
                  <td>{i.score_pct !== null && <StatusBadge status={i.alert_level} />}</td>
                  <td>
                    {['pending','in_progress'].includes(i.status) && user.id === i.inspector_id && (
                      <button className="btn btn-secondary btn-sm" onClick={e => { e.stopPropagation(); navigate(`/inspections/${i.id}/edit`); }}>
                        Preencher
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
