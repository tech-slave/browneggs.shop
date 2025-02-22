import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface AuthFormProps {
  type: 'login' | 'signup';
  redirectTo?: string;
}

export function AuthForm({ type, redirectTo = '/' }: AuthFormProps) {
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
      if (type === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        navigate('/profile', { 
          state: { 
            message: 'Account created successfully! Please login to continue.',
            from: redirectTo
          }
        });
        return;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate(redirectTo); // Redirect to the originally requested page
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate]);

  return (
    <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">
          {type === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-gray-300">
          {type === 'login'
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
        {/* Reset Password */}
        {type === 'login' && (
          <div className="text-right">
            <Link 
              to="/reset-password" 
              className="text-white-900 hover:text-blue-300"
            >
              Forgot Password?
            </Link>
          </div>
        )}

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