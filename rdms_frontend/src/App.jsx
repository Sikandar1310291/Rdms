import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Beneficiaries from './pages/Beneficiaries';
import Projects from './pages/Projects';
import Inventory from './pages/Inventory';
import Donors from './pages/Donors';
import Volunteers from './pages/Volunteers';
import AdminDashboard from './pages/AdminDashboard';
import Reports from './pages/Reports';
import { useAuth } from './context/AuthContext';

const IndexRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  switch (user.role) {
    case 'ADMIN': return <Navigate to="/dashboard" replace />;
    case 'NGO_MANAGER': return <Navigate to="/projects" replace />;
    case 'FIELD_COORDINATOR': return <Navigate to="/beneficiaries" replace />;
    case 'DONOR': return <Navigate to="/donors" replace />;
    default: return <Navigate to="/login" replace />;
  }
};

const MainLayout = ({ children }) => (
  <div className="app-container">
    <Sidebar />
    <main className="main-content">
      {children}
    </main>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<IndexRoute />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <MainLayout><Dashboard /></MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <MainLayout><AdminDashboard /></MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/beneficiaries" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'NGO_MANAGER', 'FIELD_COORDINATOR']}>
                <MainLayout><Beneficiaries /></MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/projects" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'NGO_MANAGER', 'FIELD_COORDINATOR']}>
                <MainLayout><Projects /></MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/inventory" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'NGO_MANAGER', 'FIELD_COORDINATOR']}>
                <MainLayout><Inventory /></MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/donors" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'NGO_MANAGER', 'DONOR']}>
                <MainLayout><Donors /></MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/volunteers" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'FIELD_COORDINATOR']}>
                <MainLayout><Volunteers /></MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/reports" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'NGO_MANAGER']}>
                <MainLayout><Reports /></MainLayout>
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
