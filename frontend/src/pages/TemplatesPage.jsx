import { useEffect, useState } from 'react';
import api from '../services/api';
import { Spinner, EmptyState } from '../components/common';

export default function TemplatesPage() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [open, setOpen]         = useState({});

  useEffect(() => {
    api.get('/templates')
      .then(r => {
        const data = r.data.data || [];
        setSections(data);
        // Open all by default
        const init = {};
        data.forEach(s => { init[s.id] = true; });
        setOpen(init);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalItems = sections.reduce((s, sec) => s + (sec.items?.length || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Templates de Checklist</div>
          <div className="page-sub">{sections.length} secções · {totalItems} itens no total</div>
        </div>
      </div>

      <div className="alert-bar alert-info" style={{ marginBottom:16 }}>
        ℹ️ Este é o template padrão aplicado a todas as novas inspeções. Cada item é avaliado de 1 (Mau) a 5 (Excelente).
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={32} /></div>
      ) : sections.length === 0 ? (
        <EmptyState message="Nenhum template encontrado." icon="📋" />
      ) : (
        sections.map(section => (
          <div key={section.id} className="card" style={{ marginBottom:12 }}>
            <div
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer' }}
              onClick={() => setOpen(p => ({ ...p, [section.id]: !p[section.id] }))}
            >
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:'#1E2A3A' }}>{section.name}</div>
                <div style={{ fontSize:12, color:'#888', marginTop:2 }}>{section.items?.length || 0} itens</div>
              </div>
              <span style={{ fontSize:18, color:'#aaa', userSelect:'none' }}>{open[section.id] ? '▾' : '▸'}</span>
            </div>

            {open[section.id] && (
              <div style={{ marginTop:12, borderTop:'0.5px solid rgba(0,0,0,0.07)', paddingTop:12 }}>
                {(section.items || []).map((item, i) => (
                  <div key={item.id} style={{
                    display:'flex', gap:12, alignItems:'flex-start',
                    padding:'8px 0',
                    borderBottom: i < section.items.length - 1 ? '0.5px solid rgba(0,0,0,0.05)' : 'none',
                  }}>
                    <div style={{
                      width:22, height:22, borderRadius:6, background:'#F0EEE8',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:11, fontWeight:600, color:'#888', flexShrink:0, marginTop:1,
                    }}>{i + 1}</div>
                    <div style={{ flex:1, fontSize:13, color:'#2C2C2A', lineHeight:1.5 }}>{item.text}</div>
                    <div style={{ display:'flex', gap:3, flexShrink:0 }}>
                      {[1,2,3,4,5].map(n => (
                        <div key={n} style={{
                          width:22, height:22, borderRadius:4, background:
                            n===1?'#FCEBEB':n===2?'#FDF0E8':n===3?'#FFF8E6':n===4?'#EAF3DE':'#E1F5EE',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:10, fontWeight:700,
                          color: n===1?'#A32D2D':n===2?'#993C1D':n===3?'#BA7517':n===4?'#3B6D11':'#0F6E56',
                        }}>{n}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {/* Scale legend */}
      <div className="card" style={{ marginTop:8 }}>
        <div style={{ fontSize:13, fontWeight:500, marginBottom:12 }}>Escala de Avaliação</div>
        <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
          {[
            { score:1, label:'Mau',        color:'#A32D2D', bg:'#FCEBEB' },
            { score:2, label:'Deficiente', color:'#993C1D', bg:'#FDF0E8' },
            { score:3, label:'Médio',      color:'#BA7517', bg:'#FFF8E6' },
            { score:4, label:'Bom',        color:'#3B6D11', bg:'#EAF3DE' },
            { score:5, label:'Excelente',  color:'#0F6E56', bg:'#E1F5EE' },
          ].map(s => (
            <div key={s.score} style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:28, height:28, borderRadius:6, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:s.color }}>{s.score}</div>
              <span style={{ fontSize:13, color:'#444' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
