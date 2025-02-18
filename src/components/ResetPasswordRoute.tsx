import { Navigate, useLocation } from 'react-router-dom';

interface ResetPasswordRouteProps {
  children: React.ReactNode;
}

export function ResetPasswordRoute({ children }: ResetPasswordRouteProps) {
  const location = useLocation();
  
  // Handle double hash format: /#/update-password#access_token=...
  const fullHash = window.location.hash;
  const parts = fullHash.split('#');
  // Get the last part which contains the access token
  const tokenPart = parts[parts.length - 1];
  
  console.log('Debug info:', {
    fullHash,
    parts,
    tokenPart
  });

  // Check if we have an access token
  if (!tokenPart || !tokenPart.includes('access_token=')) {
    return <Navigate to="/login" state={{ message: 'Invalid or expired password reset link' }} replace />;
  }

  return <>{children}</>;
}