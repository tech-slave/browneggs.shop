import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { isAdminemails } from '../../config/adminConfig';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
    const { user } = useAuth();
    const location = useLocation();
  
    if (!user) {
      return <Navigate to="/login?isAdmin=true" state={{ from: location.pathname }} replace />;
    }
  
    if (!isAdminemails(user.email)) {
      // Redirect unauthorized users to home with a message
      return <Navigate to="/" state={{ 
        message: "You don't have permission to access this area.",
        type: "error"
      }} replace />;
    }
  
    return <>{children}</>;
  }