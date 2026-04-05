import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Sales } from './pages/Sales';
import { AI } from './pages/AI';
import { Login } from './pages/Login';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './hooks/useAuth';

const queryClient = new QueryClient();

const RoleRedirect = () => {
  const { role, isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  switch (role) {
    case 'District Admin':
      return <Navigate to="/admin" replace />;
    case 'Store Supervisor':
      return <Navigate to="/supervisor" replace />;
    case 'Pharmacist':
      return <Navigate to="/pharmacist" replace />;
    case 'Associate':
      return <Navigate to="/billing" replace />;
    default:
      return <Dashboard />;
  }
};

import { DistrictAdminDashboard } from './pages/DistrictAdmin/DistrictAdminDashboard';
import { StoreSupervisorDashboard } from './pages/StoreSupervisor/StoreSupervisorDashboard';
import { SupervisorInventory } from './pages/StoreSupervisor/SupervisorInventory';
import { ReplenishmentHistory } from './pages/StoreSupervisor/ReplenishmentHistory';
import { BillingMonitor } from './pages/StoreSupervisor/BillingMonitor';
import { SupervisorAnalytics } from './pages/StoreSupervisor/SupervisorAnalytics';
import { StaffActivityLog } from './pages/StoreSupervisor/StaffActivityLog';
import { SupervisorSettings } from './pages/StoreSupervisor/SupervisorSettings';
import { PharmacistPanel } from './pages/Pharmacist/PharmacistPanel';
import { BillingPanel } from './pages/Associate/BillingPanel';
import { BillingHistory } from './pages/Associate/BillingHistory';
import { StaffManagement } from './pages/DistrictAdmin/StaffManagement';
import { StoreManagement } from './pages/DistrictAdmin/StoreManagement';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Main App Layout */}
          <Route path="/" element={<RoleRedirect />} />
          
          <Route path="/admin" element={<Layout><DistrictAdminDashboard /></Layout>} />
          <Route path="/admin/stores" element={<Layout><StoreManagement /></Layout>} />
          <Route path="/admin/staff" element={<Layout><StaffManagement /></Layout>} />
          <Route path="/supervisor" element={<Layout><StoreSupervisorDashboard /></Layout>} />
          <Route path="/supervisor/inventory" element={<Layout><SupervisorInventory /></Layout>} />
          <Route path="/supervisor/transfers" element={<Layout><ReplenishmentHistory /></Layout>} />
          <Route path="/supervisor/billing" element={<Layout><BillingMonitor /></Layout>} />
          <Route path="/supervisor/analytics" element={<Layout><SupervisorAnalytics /></Layout>} />
          <Route path="/supervisor/staff" element={<Layout><StaffActivityLog /></Layout>} />
          <Route path="/supervisor/settings" element={<Layout><SupervisorSettings /></Layout>} />
          <Route path="/pharmacist" element={<Layout><PharmacistPanel /></Layout>} />
          
          <Route path="/billing" element={<Layout><BillingPanel /></Layout>} />
          <Route path="/billing/history" element={<Layout><BillingHistory /></Layout>} />
          
          <Route path="/inventory" element={<Layout><Inventory /></Layout>} />
          <Route path="/sales" element={<Layout><Sales /></Layout>} />
          <Route path="/ai" element={<Layout><AI /></Layout>} />
          <Route path="/analytics" element={<Layout><div>Analytics Dashboard (Coming Soon)</div></Layout>} />
          <Route path="/transfers" element={<Layout><div>Inter-store Transfers (Coming Soon)</div></Layout>} />
          
          {/* Auth Route (No Layout) */}
          <Route path="/login" element={<Login />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
