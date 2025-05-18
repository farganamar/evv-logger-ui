import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import AppLayout from './layouts/AppLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AppointmentDetailPage from './pages/AppointmentDetailPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  const { isAuthenticated, isInitialized } = useAuth();

  // Protected route wrapper
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isInitialized) return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
    
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    
    return <>{children}</>;
  };

  // Public route wrapper (redirects if already authenticated)
  const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isInitialized) return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
    
    if (isAuthenticated) {
      return <Navigate to="/dashboard" replace />;
    }
    
    return <>{children}</>;
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<AuthLayout />}>
        <Route index element={<Navigate to="/login" replace />} />
        <Route path="login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      </Route>

      {/* Protected routes */}
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="appointments/:appointmentId" element={<AppointmentDetailPage />} />
      </Route>

      {/* Not found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;