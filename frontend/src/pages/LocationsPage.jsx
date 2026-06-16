import { useEffect, useState } from 'react';
import api from '../services/api';
import { Spinner, EmptyState, ConfirmModal } from '../components/common';

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editLoc, setEditLoc]     = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [form, setForm]           = useState({ name:'', address:'', supervisor_id:'' });
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  const fetch = () => {
    setLoading(true);
    Promise.all([api.get('/locations'), api.get('/users?role=supervisor')])
      .then(([l, u]) => { setLocations(l.data.data || []); setUsers(u.data.data || []); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  function openNew() { setEditLoc(null); setForm({ name:'', address:'', supervisor_id:'' }); setError(''); setShowModal(true); }
  function openEdit(l) { setEditLoc(l); setForm({ name:l.name, address:l.address||'', supervisor_id:l.supervisor_id||'' }); setError(''); setShowModal(true); }

  async function handleSave() {
    if (!form.name) { setError('Nome é obrigatório.'); return; }
    setSaving(true); setError('');
    try {
      if (editLoc) await api.put(`/locations/${editLoc.id}`, form);
      else         await api.post('/locations', form);
      setShowModal(false); fetch();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao guardar.');
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    try { await api.delete(`/locations/${id}`); fetch(); }
    catch (err) { alert(err.response?.data?.message || 'Erro.'); }
    finally { setConfirmDel(null); }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Localizações</div>
          <div className="page-sub">{locations.length} localizações ativas</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openNew}>+ Nova Localização</button>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={32} /></div>
      ) : locations.length === 0 ? (
        <EmptyState message="Nenhuma localização encontrada." icon="📍" />
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Nome</th><th>Morada</th><th>Supervisor</th><th></th></tr></thead>
            <tbody>
              {locations.map(l => (
                <tr key={l.id}>
                  <td style={{ fontWeight:500 }}>📍 {l.name}</td>
                  <td style={{ color:'#888', fontSize:12 }}>{l.address || '—'}</td>
                  <td style={{ color:'#888' }}>{l.supervisor_name || '—'}</td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(l)}>Editar</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirmDel(l)}>Remover</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span style={{ fontWeight:600 }}>{editLoc ? 'Editar Localização' : 'Nova Localização'}</span>
              <button onClick={() => setShowModal(false)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:18, color:'#aaa' }}>×</button>
            </div>
            <div className="modal-body">
              {error && <div style={{ background:'#FCEBEB', color:'#A32D2D', borderRadius:8, padding:'8px 12px', fontSize:13, marginBottom:12 }}>{error}</div>}
              <div className="form-group">
                <label className="form-label">Nome *</label>
                <input className="form-input" value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Morada</label>
                <input className="form-input" value={form.address} onChange={e => setForm(p=>({...p,address:e.target.value}))} placeholder="Av. Julius Nyerere, Maputo" />
              </div>
              <div className="form-group">
                <label className="form-label">Supervisor</label>
                <select className="form-select" value={form.supervisor_id} onChange={e => setForm(p=>({...p,supervisor_id:e.target.value}))}>
                  <option value="">Nenhum</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                {saving ? <Spinner size={14} /> : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDel && (
        <ConfirmModal title="Remover Localização" message={`Remover "${confirmDel.name}"?`} danger
          onConfirm={() => handleDelete(confirmDel.id)} onCancel={() => setConfirmDel(null)} />
      )}
    </div>
  );
}
