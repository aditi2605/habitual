import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../services/api';
import { setToken } from '../utils/auth';
import { ArrowLeft, Loader2, Eye, EyeOff, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordFocus, setPasswordFocus] = useState(false);

  // Password strength validation
  const passwordRequirements = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  const passwordStrength = Object.values(passwordRequirements).filter(Boolean).length;
  const isPasswordStrong = passwordStrength >= 4;

  // Email validation
  const isEmailValid = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate email
    if (!isEmailValid(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate password strength
    if (!isPasswordStrong) {
      setError('Password does not meet security requirements');
      return;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const { confirmPassword, ...signupData } = formData;
      const response = await auth.signup(signupData);
      setToken(response.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Social login handlers
  const handleGoogleSignup = async () => {
    try {
      // Get the auth URL from backend
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/google/login`);
      const data = await response.json();
      
      // Redirect to Google's OAuth page
      window.location.href = data.auth_url;
    } catch (error) {
      console.error('Google signup error:', error);
      setError('Failed to initiate Google signup. Please try again.');
    }
  };

  // const handleFacebookSignup = () => {
  //   alert('Facebook OAuth integration coming soon!');
  //   window.location.href = `${process.env.REACT_APP_API_URL}/auth/facebook/login`;
  // };

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Left Side - Decoration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-green/10 to-bg items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzZkYjg1YyIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50" />
        
        <div className="relative z-10 max-w-md">
          <div className="text-4xl font-serif text-green-light mb-6">
            🔒 Secure & Private
          </div>
          
          <h2 className="text-3xl font-serif mb-4">
            Your data is<br />
            <span className="text-green-light italic">safe with us.</span>
          </h2>
          
          <p className="text-gray-400 mb-8">
            Bank-level encryption, GDPR compliant, and we never share your data.
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <div className="w-6 h-6 rounded-md bg-green/20 flex items-center justify-center text-green text-xs">✓</div>
              256-bit SSL encryption
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <div className="w-6 h-6 rounded-md bg-green/20 flex items-center justify-center text-green text-xs">✓</div>
              GDPR & CCPA compliant
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <div className="w-6 h-6 rounded-md bg-green/20 flex items-center justify-center text-green text-xs">✓</div>
              Join 48,000+ active users
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <Link 
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-green mb-8 transition"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>

          <div className="mb-8">
            <div className="text-2xl font-serif text-green-light mb-2 lg:hidden">
               habitual
            </div>
            <h1 className="text-3xl font-serif mb-2">Create your account</h1>
            <p className="text-gray-400 text-sm">Start building better habits today — free forever</p>
          </div>

          {/* signup form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">First name</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="Alex"
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-green transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Last name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Smith"
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-green transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Email address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                className={`w-full bg-surface border rounded-xl px-4 py-3 focus:outline-none transition ${
                  formData.email && !isEmailValid(formData.email)
                    ? 'border-coral focus:border-coral'
                    : 'border-border focus:border-green'
                }`}
                required
              />
              {formData.email && !isEmailValid(formData.email) && (
                <p className="text-coral text-xs mt-1 flex items-center gap-1">
                  <XCircle size={12} />
                  Please enter a valid email address
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  onFocus={() => setPasswordFocus(true)}
                  placeholder="Create a strong password"
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-green transition"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {passwordFocus && formData.password && (
                <div className="mt-3 p-3 bg-surface border border-border rounded-xl space-y-2">
                  <div className="text-xs text-gray-400 mb-2">Password strength:</div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          level <= passwordStrength
                            ? passwordStrength <= 2
                              ? 'bg-red-500'
                              : passwordStrength <= 3
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                            : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="space-y-1 text-xs">
                    <RequirementItem met={passwordRequirements.length} text="At least 8 characters" />
                    <RequirementItem met={passwordRequirements.uppercase} text="One uppercase letter" />
                    <RequirementItem met={passwordRequirements.lowercase} text="One lowercase letter" />
                    <RequirementItem met={passwordRequirements.number} text="One number" />
                    <RequirementItem met={passwordRequirements.special} text="One special character (!@#$%^&*)" />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Confirm password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Re-enter your password"
                  className={`w-full bg-surface border rounded-xl px-4 py-3 pr-12 focus:outline-none transition ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'border-coral focus:border-coral'
                      : 'border-border focus:border-green'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-coral text-xs mt-1 flex items-center gap-1">
                  <XCircle size={12} />
                  Passwords do not match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !isPasswordStrong || formData.password !== formData.confirmPassword}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-green to-green-light text-white font-semibold hover:shadow-lg hover:shadow-green/20 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create my account'
              )}
            </button>

            <p className="text-xs text-gray-500 text-center leading-relaxed">
              By signing up you agree to our{' '}
              <a href="/terms" className="text-green hover:underline">Terms</a>
              {' '}and{' '}
              <a href="/privacypolicy" className="text-green hover:underline">Privacy Policy</a>.
            </p>

            <div className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-green hover:underline">
                Log in
              </Link>
            </div>
          </form>

          {/* or social login(google) */}

          <div className="relative mt-6 mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-bg text-gray-500">Or continue with email</span>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-coral/10 border border-coral/20 rounded-xl text-coral text-sm flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

           {/* Social Login Buttons */}
          <div className="flex justify-center mb-6">
            <button
              onClick={handleGoogleSignup}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-surface border border-border rounded-xl hover:border-green transition align-center items-center justify-center"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm">Google</span>
            </button>
            {/* <button
              onClick={handleFacebookSignup}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-surface border border-border rounded-xl hover:border-green transition"
            >
              <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-sm">Facebook</span>
            </button> */}
          </div>

        </div>
      </div>
    </div>
  );
};

// Helper component for password requirements
const RequirementItem = ({ met, text }) => (
  <div className={`flex items-center gap-2 ${met ? 'text-green' : 'text-gray-500'}`}>
    {met ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
    <span>{text}</span>
  </div>
);

export default Signup;