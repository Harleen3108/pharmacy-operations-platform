import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Sales } from './pages/Sales';
import { AI } from './pages/AI';
import { Login } from './pages/Login';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Main App Layout */}
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
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
