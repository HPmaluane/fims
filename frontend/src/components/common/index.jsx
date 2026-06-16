// ─── STATUS BADGE ───────────────────────────────────────────
const statusLabels = {
  pending: 'Pendente', in_progress: 'Em Progresso',
  submitted: 'Submetida', reviewed: 'Revisada', closed: 'Fechada',
  ok: 'OK', warning: 'Aviso', critical: 'Crítico',
  admin: 'Admin', ceo: 'CEO', supervisor: 'Supervisor', inspector: 'Inspetor',
};

export function StatusBadge({ status }) {
  return (
    <span className={`badge badge-${status}`}>
      {statusLabels[status] || status}
    </span>
  );
}

// ─── SCORE RING ─────────────────────────────────────────────
function scoreColor(pct) {
  if (pct >= 90) return '#0F6E56';
  if (pct >= 75) return '#3B6D11';
  if (pct >= 60) return '#BA7517';
  if (pct >= 40) return '#993C1D';
  return '#A32D2D';
}

export function ScoreRing({ pct, size = 48 }) {
  if (pct === null || pct === undefined) return <span style={{ fontSize: 12, color: '#aaa' }}>—</span>;
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = scoreColor(pct);
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E8EDF2" strokeWidth="3" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span style={{ fontSize: size < 44 ? 10 : 12, fontWeight: 600, color, zIndex: 1 }}>{pct}%</span>
    </div>
  );
}

// ─── PROGRESS BAR ───────────────────────────────────────────
export function ProgressBar({ value, color }) {
  const c = color || scoreColor(value);
  return (
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${value}%`, background: c }} />
    </div>
  );
}

// ─── MINI BAR CHART (SVG) ───────────────────────────────────
export function MiniBarChart({ data = [], height = 100 }) {
  if (!data.length) return <div style={{ height, display:'flex', alignItems:'center', justifyContent:'center', color:'#ccc', fontSize:12 }}>Sem dados</div>;
  const max = Math.max(...data.map(d => d.value || 0), 1);
  const barW = Math.max(8, Math.floor(220 / data.length) - 4);
  return (
    <svg viewBox={`0 0 ${data.length * (barW + 4)} ${height}`} style={{ width: '100%', height }}>
      {data.map((d, i) => {
        const barH = Math.max(2, ((d.value || 0) / max) * (height - 20));
        const x = i * (barW + 4);
        const color = scoreColor(d.value || 0);
        return (
          <g key={i}>
            <rect x={x} y={height - 20 - barH} width={barW} height={barH} fill={color} rx="2" opacity="0.85" />
            <text x={x + barW/2} y={height - 4} textAnchor="middle" fontSize="8" fill="#aaa">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── SPINNER ────────────────────────────────────────────────
export function Spinner({ size = 20 }) {
  return <div className="spinner" style={{ width: size, height: size }} />;
}

// ─── EMPTY STATE ────────────────────────────────────────────
export function EmptyState({ message = 'Sem dados', icon = '📋' }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px', color: '#aaa' }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 14 }}>{message}</div>
    </div>
  );
}

// ─── CONFIRM MODAL ──────────────────────────────────────────
export function ConfirmModal({ title, message, onConfirm, onCancel, danger }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span style={{ fontWeight: 600 }}>{title}</span>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 14, color: '#444' }}>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onCancel}>Cancelar</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'} btn-sm`} onClick={onConfirm}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}
