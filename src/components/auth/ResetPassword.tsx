import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ResetPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      console.log('Redirecting to:', `${window.location.origin}/#/update-password`);
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `https://browneggs.shop/#/update-password`,
      });
      
      if (error) throw error;
      
      console.log('Password reset response:', data);
      setSuccess(true);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] mt-20 bg-gradient-to-br from-[#2B86C5] via-[#784BA0] to-[#F76B1C] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
          <p className="text-gray-300">
            Enter your email to receive reset instructions
          </p>
        </div>

      {success ? (
        <div className="text-center">
          <div className="text-green-400 mb-4">
            Check your email for the password reset link
          </div>
          <Link to="/login" className="text-blue-400 hover:text-blue-300">
            Back to Login
          </Link>
        </div>
      ) : (
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
            {loading ? 'Sending...' : 'Send Reset Instructions'}
          </button>

          <div className="text-center">
            <Link to="/login" className="text-sm text-blue-400 hover:text-blue-300">
              Back to Login
            </Link>
          </div>
        </form>
      )}
    </div>
    </div>
  );
}