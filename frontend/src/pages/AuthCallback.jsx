import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setToken } from '../utils/auth';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      console.log('Token received:', token.substring(0, 20) + '...');
      
      // Save token to localStorage
      setToken(token, true); // true = remember me (30 days)
      
      // Small delay to ensure token is saved
      setTimeout(() => {
        console.log('Redirecting to dashboard...');
        navigate('/dashboard', { replace: true });
      }, 500);
    } else {
      console.error('No token in URL');
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="text-center">
        <Loader2 size={48} className="animate-spin text-green mx-auto mb-4" />
        <p className="text-gray-400">Completing authentication...</p>
        <p className="text-gray-600 text-sm mt-2">Setting up your account...</p>
      </div>
    </div>
  );
};

export default AuthCallback;