import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Lock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export function UpdatePasswordForm() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      // Debug: Log the full URL and hash
      console.log('Current URL:', window.location.href);
      console.log('Full hash:', window.location.hash);
  
      // Parse all URL parameters
      const hashParams = new URLSearchParams(
        window.location.hash.split('#').pop()?.split('?').pop() || ''
      );
      
      // Get all the required auth parameters
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');
  
      console.log('Parsed parameters:', { 
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        type
      });
  
      if (!accessToken || type !== 'recovery') {
        throw new Error('Invalid password reset link');
      }
  
      // Debug: Log before setting session
      console.log('Attempting to set session with token...');
  
    // Set the session with both tokens
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || ''
    });

    if (sessionError) throw sessionError;

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({ 
      password: password 
    });
    
    if (updateError) throw updateError;

    // Sign out the user after password update
    await supabase.auth.signOut();
    
    // Navigate to login with success message
    navigate('/login', { 
      state: { 
        message: 'Password updated successfully! Please login with your new password.' 
      },
      replace: true // Replace the current history entry
    });
  } catch (err) {
    console.error('Update password error:', err);
    setError(err instanceof Error ? err.message : 'An error occurred');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="h-[calc(100vh-4rem)] mt-20 bg-gradient-to-br from-[#2B86C5] via-[#784BA0] to-[#F76B1C] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Update Password</h2>
          <p className="text-gray-300">Enter your new password</p>
        </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Password"
            className="w-full pl-10 pr-4 py-2 bg-black/20 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
            required
            minLength={6}
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
    </div>
  );
}