import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { useEffect, useState } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const currentPath = location.pathname;

  const checkProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('is_profile_completed')
      .eq('id', user.id)
      .single();
    
    // Handle PGRST116 (no rows) as false rather than error
    if (error && error.code === 'PGRST116') {
      setIsProfileComplete(false);
      return;
    }

    if (!error) {
      setIsProfileComplete(data?.is_profile_completed ?? false);
    }
  };

  useEffect(() => {
    checkProfile();

    const channel = supabase.channel('profile-updates');
    
    channel
      .on('broadcast', { event: 'profile_updated' }, (payload) => {
        if (payload.payload?.user_id === user?.id) {
          checkProfile();
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Show loading only briefly while checking profile first time
  if (isProfileComplete === null) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (!isProfileComplete && currentPath !== '/profile') {
    return <Navigate to="/profile" state={{ isNewUser: true }} replace />;
  }

  return children;
}