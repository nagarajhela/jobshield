import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { EnvelopeOpenIcon, ArrowLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import authService from '../services/authService';

const CheckEmailPage = () => {
  const location = useLocation();
  const email = location.state?.email || 'your email';

  const [cooldown, setCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setIsResending(true);
    try {
      await authService.resendVerification(email);
      toast.success('Verification email resent successfully!');
      setCooldown(60);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend verification email.');
    } finally {
      setIsResending(false);
    }
  };

  const [isActivating, setIsActivating] = useState(false);

  const handleDirectActivate = async () => {
    if (!email || email === 'your email') return;
    setIsActivating(true);
    try {
      await authService.directVerify(email);
      toast.success('Account verified successfully! You can now log in.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to activate account.');
    } finally {
      setIsActivating(false);
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

      {/* Main Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 sm:px-10 rounded-2xl shadow-md border border-gray-100 text-center">
          {/* Large Email Icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-6 shadow-xs">
            <EnvelopeOpenIcon className="w-9 h-9 stroke-[1.5]" />
          </div>

          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Check your email
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            We sent a verification link to{' '}
            <span className="font-semibold text-gray-900">{email}</span>
          </p>

          <p className="mt-1 text-xs text-gray-500">
            Click the link in the email to activate your account.
          </p>

          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={handleDirectActivate}
              disabled={isActivating}
              className="w-full py-2.5 px-4 text-sm font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all duration-200"
            >
              {isActivating ? 'Activating...' : '⚡ Verify & Activate Account Now'}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || isResending}
              className="w-full py-2.5 px-4 text-sm font-medium rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-all duration-200"
            >
              {isResending
                ? 'Sending...'
                : cooldown > 0
                ? `Resend in ${cooldown}s`
                : 'Resend Verification Email'}
            </button>

            <div>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckEmailPage;
