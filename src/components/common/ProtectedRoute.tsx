import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // Store the requested URL in state when redirecting to login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}