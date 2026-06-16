import { useEffect, useState } from 'react';
import api from '../services/api';
import { StatusBadge, Spinner, EmptyState, ConfirmModal } from '../components/common';
import { useAuth } from '../context/AuthContext';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editUser, setEditUser]     = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [form, setForm]             = useState({ name:'', email:'', password:'', role:'inspector' });
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');

  const fetchUsers = () => {
    setLoading(true);
    api.get('/users').then(r => setUsers(r.data.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  function openNew() { setEditUser(null); setForm({ name:'', email:'', password:'', role:'inspector' }); setError(''); setShowModal(true); }
  function openEdit(u) { setEditUser(u); setForm({ name:u.name, email:u.email, password:'', role:u.role }); setError(''); setShowModal(true); }

  async function handleSave() {
    if (!form.name || !form.email) { setError('Nome e email são obrigatórios.'); return; }
    if (!editUser && !form.password) { setError('Password obrigatória para novos utilizadores.'); return; }
    setSaving(true); setError('');
    try {
      if (editUser) {
        const payload = { name:form.name, email:form.email, role:form.role };
        if (form.password) payload.password = form.password;
        await api.put(`/users/${editUser.id}`, payload);
      } else {
        await api.post('/auth/register', form);
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao guardar.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    try { await api.delete(`/users/${id}`); fetchUsers(); }
    catch (err) { alert(err.response?.data?.message || 'Erro ao desativar.'); }
    finally { setConfirmDel(null); }
  }

  const roleLabels = { admin:'Administrador', ceo:'CEO', supervisor:'Supervisor', inspector:'Inspetor' };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Utilizadores</div>
          <div className="page-sub">{users.length} utilizadores registados</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openNew}>+ Novo Utilizador</button>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={32} /></div>
      ) : users.length === 0 ? (
        <EmptyState message="Nenhum utilizador encontrado." icon="👥" />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Nome</th><th>Email</th><th>Perfil</th><th>Estado</th><th>Criado em</th><th></th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight:500 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:30, height:30, borderRadius:'50%', background:'#E6F1FB', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:600, color:'#185FA5', flexShrink:0 }}>{u.avatar}</div>
                      {u.name}
                    </div>
                  </td>
                  <td style={{ color:'#888' }}>{u.email}</td>
                  <td><StatusBadge status={u.role} /></td>
                  <td><span className={`badge ${u.active ? 'badge-ok' : 'badge-critical'}`}>{u.active ? 'Ativo' : 'Inativo'}</span></td>
                  <td style={{ color:'#888', fontSize:12 }}>{new Date(u.created_at).toLocaleDateString('pt-PT')}</td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(u)}>Editar</button>
                      {u.id !== currentUser.id && (
                        <button className="btn btn-danger btn-sm" onClick={() => setConfirmDel(u)}>Desativar</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span style={{ fontWeight:600 }}>{editUser ? 'Editar Utilizador' : 'Novo Utilizador'}</span>
              <button onClick={() => setShowModal(false)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:18, color:'#aaa' }}>×</button>
            </div>
            <div className="modal-body">
              {error && <div style={{ background:'#FCEBEB', color:'#A32D2D', borderRadius:8, padding:'8px 12px', fontSize:13, marginBottom:12 }}>{error}</div>}
              <div className="form-group">
                <label className="form-label">Nome *</label>
                <input className="form-input" value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input className="form-input" type="email" value={form.email} onChange={e => setForm(p=>({...p,email:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">{editUser ? 'Nova Password (deixe em branco para manter)' : 'Password *'}</label>
                <input className="form-input" type="password" value={form.password} onChange={e => setForm(p=>({...p,password:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Perfil</label>
                <select className="form-select" value={form.role} onChange={e => setForm(p=>({...p,role:e.target.value}))}>
                  {Object.entries(roleLabels).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
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
        <ConfirmModal
          title="Desativar Utilizador"
          message={`Deseja desativar "${confirmDel.name}"? O utilizador não conseguirá aceder ao sistema.`}
          danger
          onConfirm={() => handleDelete(confirmDel.id)}
          onCancel={() => setConfirmDel(null)}
        />
      )}
    </div>
  );
}
