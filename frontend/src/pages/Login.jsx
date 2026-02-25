import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import { setToken } from '../utils/auth';
import { ArrowLeft, Loader2 } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await auth.login(formData);
      setToken(response.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Left Side - Decoration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-green/10 to-bg items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzZkYjg1YyIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50" />
        
        <div className="relative z-10 max-w-md">
          <div className="text-4xl font-serif text-green-light mb-6 flex items-center gap-3">
            habitual
          </div>
          
          <h2 className="text-3xl font-serif mb-4">
            Build habits that<br />
            <span className="text-green-light italic">stick around.</span>
          </h2>
          
          <p className="text-gray-400 mb-8">
            Track daily habits, get notified before you slip, and discover your patterns with weekly AI insights.
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <div className="w-6 h-6 rounded-md bg-green/20 flex items-center justify-center text-green text-xs">✓</div>
              Daily habit tracking with streak protection
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <div className="w-6 h-6 rounded-md bg-green/20 flex items-center justify-center text-green text-xs">✓</div>
              Smart notifications — not annoying spam
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <div className="w-6 h-6 rounded-md bg-green/20 flex items-center justify-center text-green text-xs">✓</div>
              Weekly & monthly analytics dashboards
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <div className="w-6 h-6 rounded-md bg-green/20 flex items-center justify-center text-green text-xs">✓</div>
              Compete on leaderboards & earn badges
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <Link 
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-green mb-8 transition"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>

          <div className="mb-8">
            <div className="text-2xl font-serif text-green-light mb-2 flex items-center gap-2 lg:hidden">
              habitual
            </div>
            <h1 className="text-3xl font-serif mb-2">Welcome back</h1>
            <p className="text-gray-400 text-sm">Log in to your account to continue</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-coral/10 border border-coral/20 rounded-xl text-coral text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Email address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-green transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-green transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-green to-green-light text-white font-semibold hover:shadow-lg hover:shadow-green/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Logging in...
                </>
              ) : (
                'Log in to Habitual →'
              )}
            </button>

            <div className="text-center text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/signup" className="text-green hover:underline">
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;