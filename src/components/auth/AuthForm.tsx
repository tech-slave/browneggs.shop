import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { isAdminemails } from '../../config/adminConfig';

interface AuthFormProps {
  type: 'login' | 'signup';
  redirectTo?: string;
  isAdmin?: boolean; 
}

export function AuthForm({ type, redirectTo = '/',isAdmin=false }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      // For signup, only allow non-admin emails
      if (type === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;

      // Check if it's an admin email after successful signup
      if (isAdminemails(email)) {
        // Sign out the user first
        await supabase.auth.signOut();
        // Then redirect to admin login with message
        navigate('/login?isAdmin=true', { 
          state: { 
            message: 'Admin account created successfully! Please login here to access the admin portal.',
            type: 'success'
          }
        });
      } else {
        navigate('/profile', { 
          state: { 
            message: 'Account created successfully! Please login to continue.',
            from: redirectTo
          }
        });
      }
      return;
      } else {
        // For login, check if the email matches the intended login type
        const isAdminEmail = isAdminemails(email);
        
        if (isAdmin && !isAdminEmail) {
          throw new Error('This login is restricted to admin users only.');
        }
        
        if (!isAdmin && isAdminEmail) {
          throw new Error('Admin accounts must use the admin login page.');
        }
  
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
  
        // Redirect based on user type
        if (isAdminEmail) {
          navigate('/oms');
        } else {
          navigate(redirectTo);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      // Modify the auto-redirect logic
      if (isAdmin) {
        navigate('/oms');
      } else {
        navigate('/profile');
      }
    }
  }, [user, navigate, isAdmin]);

  return (
    <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">
          {isAdmin ? 'Admin Access' : type === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-gray-300">
          {isAdmin 
            ? 'Sign in to manage orders'
            : type === 'login'
              ? 'Sign in to access your account'
              : 'Sign up to get Healthy'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full pl-10 pr-4 py-2 bg-black/20 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full pl-10 pr-12 py-2 bg-black/20 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {/* Reset Password - Only show for non-admin login */}
        {type === 'login' && !isAdmin && (
          <div className="text-right">
            <Link 
              to="/reset-password" 
              className="text-white-900 hover:text-blue-300"
            >
              Forgot Password?
            </Link>
          </div>
        )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-amber-500 font-medium">{error}</p>
        </div>
      )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? 'Loading...' : type === 'login' ? 'Sign In' : 'Sign Up'}
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-gray-600 w-full"></div>
          <span className="bg-gray-900 px-4 text-sm text-gray-400">or</span>
          <div className="border-t border-gray-600 w-full"></div>
        </div>
      </form>
    </div>
  );
}