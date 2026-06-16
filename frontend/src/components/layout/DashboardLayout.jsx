import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import api from '../../services/api';

const titles = {
  '/dashboard':   'Dashboard',
  '/inspections': 'Inspeções',
  '/alerts':      'Alertas',
  '/reports':     'Relatórios',
  '/users':       'Utilizadores',
  '/locations':   'Localizações',
  '/templates':   'Templates',
  '/audit':       'Auditoria',
};

function BellIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  );
}

export default function DashboardLayout() {
  const location = useLocation();
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    api.get('/inspections?status=submitted')
      .then(({ data }) => {
        const critical = (data.data || []).filter(i => i.alert_level === 'critical').length;
        setAlertCount(critical);
      })
      .catch(() => {});
  }, [location.pathname]);

  const title = Object.entries(titles).find(([k]) => location.pathname.startsWith(k))?.[1] || 'FIMS';

  return (
    <div className="fims-app">
      <Sidebar alertCount={alertCount} />
      <div className="main">
        <div className="topbar">
          <div className="topbar-title">{title}</div>
          <div className="topbar-spacer" />
          <div className="topbar-actions">
            <button className={`icon-btn${alertCount > 0 ? ' notif-dot' : ''}`} title="Alertas">
              <BellIcon />
            </button>
          </div>
        </div>
        <div className="page">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
