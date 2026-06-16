import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import HomePage    from './pages/HomePage';
import LoginPage   from './pages/LoginPage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage   from './pages/DashboardPage';
import InspectionsPage from './pages/InspectionsPage';
import InspectionDetailPage from './pages/InspectionDetailPage';
import InspectionFormPage   from './pages/InspectionFormPage';
import UsersPage    from './pages/UsersPage';
import LocationsPage from './pages/LocationsPage';
import AlertsPage   from './pages/AlertsPage';
import ReportsPage  from './pages/ReportsPage';
import AuditPage    from './pages/AuditPage';
import TemplatesPage from './pages/TemplatesPage';

function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}><div className="spinner" /></div>;
  if (!user)   return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}><div className="spinner" /></div>;

  return (
    <Routes>
      <Route path="/"      element={<HomePage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />

      <Route path="/" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
        <Route path="dashboard"   element={<DashboardPage />} />
        <Route path="inspections" element={<InspectionsPage />} />
        <Route path="inspections/new"  element={<InspectionFormPage />} />
        <Route path="inspections/:id"  element={<InspectionDetailPage />} />
        <Route path="inspections/:id/edit" element={<InspectionFormPage />} />
        <Route path="alerts"    element={<AlertsPage />} />
        <Route path="reports"   element={<ReportsPage />} />
        <Route path="templates" element={<TemplatesPage />} />
        <Route path="users"     element={<PrivateRoute roles={['admin','ceo','supervisor']}><UsersPage /></PrivateRoute>} />
        <Route path="locations" element={<LocationsPage />} />
        <Route path="audit"     element={<PrivateRoute roles={['admin','ceo']}><AuditPage /></PrivateRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
