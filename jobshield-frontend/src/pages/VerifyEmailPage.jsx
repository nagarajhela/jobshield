import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import authService from '../services/authService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'expired' | 'invalid'
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('invalid');
        return;
      }

      try {
        await authService.verifyEmail(token);
        setStatus('success');
      } catch (error) {
        const message = error.response?.data?.message || '';
        if (message.toLowerCase().includes('expired')) {
          setStatus('expired');
        } else {
          setStatus('invalid');
        }
      }
    };

    verify();
  }, [token]);

  const handleRequestNewLink = async (e) => {
    e.preventDefault();
    if (!resendEmail || !resendEmail.includes('@')) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setIsResending(true);
    try {
      await authService.resendVerification(resendEmail.trim());
      toast.success('New verification link sent to your email!');
      setResendEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send new verification link.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
            <ShieldCheckIcon className="w-7 h-7 stroke-[2]" />
          </div>
          <div className="text-left">
            <span className="text-2xl font-black tracking-tight text-gray-900 block leading-none">
              Job<span className="text-blue-600">Shield</span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              AI Job Scam Protection
            </span>
          </div>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 sm:px-10 rounded-2xl shadow-md border border-gray-100 text-center">
          {/* Loading State */}
          {status === 'loading' && (
            <div className="py-6 flex flex-col items-center gap-4">
              <LoadingSpinner size="lg" color="primary" />
              <p className="text-sm font-medium text-gray-700">Verifying your email address...</p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="animate-fade-in">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-6">
                <CheckCircleIcon className="w-10 h-10 stroke-[1.5] animate-bounce" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                Email Verified!
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Your account is now active.
              </p>
              <div className="mt-8">
                <Link
                  to="/login"
                  className="w-full inline-flex justify-center items-center py-2.5 px-4 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all duration-200"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          )}

          {/* Expired Token State */}
          {status === 'expired' && (
            <div className="animate-fade-in">
              <div className="mx-auto w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-6">
                <XCircleIcon className="w-10 h-10 stroke-[1.5]" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                Link Expired
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                This verification link has expired.
              </p>
              <form onSubmit={handleRequestNewLink} className="mt-6 space-y-4 text-left">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Enter your email to receive a new link:
                  </label>
                  <div className="relative rounded-lg shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <EnvelopeIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      className="block w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isResending}
                  className="w-full py-2.5 px-4 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-60 transition-all duration-200"
                >
                  {isResending ? 'Sending...' : 'Request New Link'}
                </button>
              </form>
            </div>
          )}

          {/* Invalid Token State */}
          {status === 'invalid' && (
            <div className="animate-fade-in">
              <div className="mx-auto w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-6">
                <XCircleIcon className="w-10 h-10 stroke-[1.5]" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                Invalid Link
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                This link is not valid.
              </p>
              <div className="mt-8">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Return to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
