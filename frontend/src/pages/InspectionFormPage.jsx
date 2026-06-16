import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Spinner } from '../components/common';
import { useAuth } from '../context/AuthContext';

export default function InspectionFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user }  = useAuth();
  const isNew = !id;

  const [inspection, setInspection] = useState(null);
  const [locations, setLocations]   = useState([]);
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New inspection form state
  const [newForm, setNewForm] = useState({ location_id: '', inspector_id: user.id, inspection_date: new Date().toISOString().split('T')[0], notes: '' });

  useEffect(() => {
    const promises = [api.get('/locations'), api.get('/users')];
    if (!isNew) promises.push(api.get(`/inspections/${id}`));

    Promise.all(promises)
      .then(([lRes, uRes, iRes]) => {
        setLocations(lRes.data.data || []);
        setUsers((uRes.data.data || []).filter(u => u.role === 'inspector'));
        if (iRes) setInspection(iRes.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newForm.location_id) { alert('Selecione uma localização.'); return; }
    setSaving(true);
    try {
      const { data } = await api.post('/inspections', newForm);
      navigate(`/inspections/${data.data.id}/edit`, { replace: true });
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao criar inspeção.');
    } finally {
      setSaving(false);
    }
  }

  function handleScoreChange(itemId, score) {
    setInspection(prev => ({
      ...prev,
      items: prev.items.map(i => i.id === itemId ? { ...i, score } : i),
    }));
  }

  function handleCommentChange(itemId, comment) {
    setInspection(prev => ({
      ...prev,
      items: prev.items.map(i => i.id === itemId ? { ...i, comment } : i),
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const { data } = await api.patch(`/inspections/${id}/items`, { items: inspection.items });
      setInspection(data.data);
      alert('Progresso guardado!');
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao guardar.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit() {
    if (!window.confirm('Submeter a inspeção? Esta ação não pode ser desfeita.')) return;
    setSubmitting(true);
    try {
      await api.patch(`/inspections/${id}/items`, { items: inspection.items });
      await api.patch(`/inspections/${id}/submit`);
      navigate(`/inspections/${id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Erro ao submeter.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={32} /></div>;

  // ─── CREATE NEW ──────────────────────────────────────────
  if (isNew) {
    return (
      <div style={{ maxWidth: 560 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/inspections')}>← Voltar</button>
          <div className="page-title">Nova Inspeção</div>
        </div>
        <div className="card">
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Localização *</label>
              <select className="form-select" value={newForm.location_id} onChange={e => setNewForm(p => ({ ...p, location_id: e.target.value }))} required>
                <option value="">Selecionar localização...</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            {['admin','ceo','supervisor'].includes(user.role) && (
              <div className="form-group">
                <label className="form-label">Inspetor</label>
                <select className="form-select" value={newForm.inspector_id} onChange={e => setNewForm(p => ({ ...p, inspector_id: e.target.value }))}>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Data da Inspeção</label>
              <input className="form-input" type="date" value={newForm.inspection_date} onChange={e => setNewForm(p => ({ ...p, inspection_date: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Notas (opcional)</label>
              <textarea className="form-input" rows={3} value={newForm.notes} onChange={e => setNewForm(p => ({ ...p, notes: e.target.value }))} placeholder="Observações gerais..." />
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/inspections')}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <Spinner size={14} /> : 'Criar Inspeção'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ─── FILL CHECKLIST ─────────────────────────────────────
  if (!inspection) return null;

  const sections = {};
  (inspection.items || []).forEach(item => {
    if (!sections[item.section_code]) sections[item.section_code] = { name: item.section_name, items: [] };
    sections[item.section_code].items.push(item);
  });

  const answered = (inspection.items || []).filter(i => i.score !== null).length;
  const total    = (inspection.items || []).length;
  const pct      = total > 0 ? Math.round((answered / total) * 100) : 0;

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/inspections/${id}`)}>← Voltar</button>
        <div style={{ flex:1 }}>
          <div className="page-title">{inspection.location_name}</div>
          <div className="page-sub">{inspection.inspection_date}</div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:12, color:'#888' }}>Progresso</div>
          <div style={{ fontSize:14, fontWeight:600 }}>{answered}/{total} ({pct}%)</div>
        </div>
      </div>

      {/* Progress */}
      <div style={{ background:'#E8EDF2', borderRadius:3, height:6, marginBottom:20, overflow:'hidden' }}>
        <div style={{ height:'100%', background:'#378ADD', borderRadius:3, width:`${pct}%`, transition:'width 0.3s' }} />
      </div>

      {/* Sections */}
      {Object.entries(sections).map(([code, section]) => (
        <div key={code} className="card" style={{ marginBottom:12 }}>
          <div style={{ fontSize:14, fontWeight:600, marginBottom:12, color:'#1E2A3A' }}>{section.name}</div>
          {section.items.map(item => (
            <div key={item.id} className={`checklist-item${item.score !== null ? ' scored' : ''}`} style={{ marginBottom:10 }}>
              <div style={{ fontSize:13, color:'#2C2C2A', marginBottom:10 }}>{item.text}</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom: 6 }}>
                {[1,2,3,4,5].map(n => (
                  <button
                    key={n}
                    type="button"
                    className={`score-btn score-${n}${item.score === n ? ' selected' : ''}`}
                    onClick={() => handleScoreChange(item.id, item.score === n ? null : n)}
                  >{n}</button>
                ))}
                <span style={{ fontSize:11, color:'#aaa', alignSelf:'center', marginLeft:4 }}>
                  {['','Mau','Deficiente','Médio','Bom','Excelente'][item.score] || ''}
                </span>
              </div>
              <input
                className="form-input"
                placeholder="Comentário (opcional)..."
                style={{ fontSize:12, padding:'6px 10px' }}
                value={item.comment || ''}
                onChange={e => handleCommentChange(item.id, e.target.value)}
              />
            </div>
          ))}
        </div>
      ))}

      {/* Actions */}
      <div style={{ display:'flex', gap:10, justifyContent:'flex-end', paddingTop:8, position:'sticky', bottom:0, background:'#F8F7F4', padding:'16px 0' }}>
        <button className="btn btn-secondary" onClick={() => navigate(`/inspections/${id}`)}>Cancelar</button>
        <button className="btn btn-secondary" onClick={handleSave} disabled={saving}>
          {saving ? <Spinner size={14} /> : '💾 Guardar Progresso'}
        </button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting || answered === 0}>
          {submitting ? <Spinner size={14} /> : '✅ Submeter Inspeção'}
        </button>
      </div>
    </div>
  );
}
