import { useEffect, useState } from 'react';
import api from '../services/api';
import { Spinner, EmptyState } from '../components/common';

export default function AuditPage() {
  const [logs, setLogs]     = useState([]);
  const [total, setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage]     = useState(0);
  const limit = 50;

  useEffect(() => {
    setLoading(true);
    api.get(`/audit-logs?limit=${limit}&offset=${page * limit}`)
      .then(r => { setLogs(r.data.data.logs || []); setTotal(r.data.data.total || 0); })
      .finally(() => setLoading(false));
  }, [page]);

  const actionColors = {
    LOGIN: '#185FA5', LOGOUT: '#888', REGISTER: '#0F6E56',
    CREATE_INSPECTION: '#534AB7', SUBMIT_INSPECTION: '#3B6D11',
    REVIEW_INSPECTION: '#BA7517',
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Auditoria</div>
          <div className="page-sub">{total} entradas de auditoria</div>
        </div>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={32} /></div>
      ) : logs.length === 0 ? (
        <EmptyState message="Sem registos de auditoria." icon="🛡️" />
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Data/Hora</th><th>Utilizador</th><th>Ação</th><th>Detalhe</th><th>IP</th></tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontSize:12, color:'#888', whiteSpace:'nowrap' }}>
                      {new Date(log.created_at).toLocaleString('pt-PT')}
                    </td>
                    <td style={{ fontSize:13 }}>{log.user_name || '—'}</td>
                    <td>
                      <span style={{
                        display:'inline-block', fontSize:11, fontWeight:600, padding:'2px 8px',
                        borderRadius:12, background:`${actionColors[log.action] || '#888'}18`,
                        color: actionColors[log.action] || '#888',
                      }}>{log.action}</span>
                    </td>
                    <td style={{ fontSize:12, color:'#444', maxWidth:300, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {log.detail || '—'}
                    </td>
                    <td style={{ fontSize:11, color:'#aaa', fontFamily:'monospace' }}>{log.ip_address || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:12, marginTop:16 }}>
            <button className="btn btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Anterior</button>
            <span style={{ fontSize:13, color:'#888' }}>Página {page + 1} de {Math.ceil(total / limit)}</span>
            <button className="btn btn-secondary btn-sm" disabled={(page + 1) * limit >= total} onClick={() => setPage(p => p + 1)}>Próxima →</button>
          </div>
        </>
      )}
    </div>
  );
}
