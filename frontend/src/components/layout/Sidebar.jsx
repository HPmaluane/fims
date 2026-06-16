import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const roleLabels = { admin:'Administrador', ceo:'CEO', supervisor:'Supervisor', inspector:'Inspetor' };

function Icon({ name, size = 16 }) {
  const icons = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    inspections: <><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></>,
    alert: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    reports: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    users: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>,
    locations: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></>,
    templates: <><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></>,
    audit: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
    logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
}

export default function Sidebar({ alertCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const isAdmin      = ['admin','ceo'].includes(user.role);
  const isSupervisor = ['admin','ceo','supervisor'].includes(user.role);

  const mainNav = [
    { to: '/dashboard',   label: 'Dashboard',   icon: 'dashboard' },
    { to: '/inspections', label: 'Inspeções',   icon: 'inspections' },
    { to: '/alerts',      label: 'Alertas',     icon: 'alert', badge: alertCount },
    { to: '/reports',     label: 'Relatórios',  icon: 'reports' },
  ];

  const adminNav = [
    ...(isSupervisor ? [{ to: '/users',     label: 'Utilizadores', icon: 'users' }] : []),
    { to: '/locations', label: 'Localizações', icon: 'locations' },
    { to: '/templates', label: 'Templates',    icon: 'templates' },
    ...(isAdmin ? [{ to: '/audit', label: 'Auditoria', icon: 'audit' }] : []),
  ];

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-text">FIMS</div>
        <div className="logo-sub">Facility Inspection Mgmt</div>
      </div>

      <div className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-label">Principal</div>
          {mainNav.map(item => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
              <Icon name={item.icon} size={16} />
              <span>{item.label}</span>
              {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
            </NavLink>
          ))}
        </div>

        {adminNav.length > 0 && (
          <div className="nav-section">
            <div className="nav-section-label">Gestão</div>
            {adminNav.map(item => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}>
                <Icon name={item.icon} size={16} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>

      <div className="sidebar-user">
        <div className="user-avatar-sm">{user.avatar}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="user-name-sm" style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name}</div>
          <div className="user-role-sm">{roleLabels[user.role]}</div>
        </div>
        <button className="icon-btn" title="Logout" style={{ border:'none', background:'transparent', color:'rgba(255,255,255,0.5)', cursor:'pointer' }} onClick={logout}>
          <Icon name="logout" size={14} />
        </button>
      </div>
    </nav>
  );
}
