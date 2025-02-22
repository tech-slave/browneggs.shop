import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { useEffect, useState } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const currentPath = location.pathname;

  useEffect(() => {
    const checkProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_profile_completed')
          .eq('id', user.id)
          .single();
        
        setIsProfileComplete(data?.is_profile_completed ?? false);
      }
    };

    // Initial check
    checkProfile();

    // Set up real-time subscription
    const subscription = supabase
      .channel('profile-changes')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user?.id}`
        },
        (payload) => {
          const updatedProfile = payload.new as { is_profile_completed: boolean };
          setIsProfileComplete(updatedProfile.is_profile_completed);
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Show loading state while checking profile
  if (isProfileComplete === null) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // If profile is not complete and user is trying to access any page other than profile
  if (!isProfileComplete && currentPath !== '/profile') {
    return <Navigate to="/profile" state={{ isNewUser: true }} replace />;
  }

  return children;
}