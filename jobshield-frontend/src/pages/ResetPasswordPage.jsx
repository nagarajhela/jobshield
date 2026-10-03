import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import authService from '../services/authService';

const schema = yup.object({
  password: yup
    .string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: yup
    .string()
    .required('Please confirm your new password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

const calculateStrength = (pwd = '') => {
  if (!pwd) return { score: 0, label: 'None', color: 'bg-gray-200' };

  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (/[A-Z]/.test(pwd)) score += 1;
  if (/[a-z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

  if (score <= 2) {
    return { score: 1, label: 'Weak', color: 'bg-red-500', text: 'text-red-600', width: 'w-1/4' };
  }
  if (score === 3) {
    return { score: 2, label: 'Fair', color: 'bg-orange-500', text: 'text-orange-600', width: 'w-2/4' };
  }
  if (score === 4) {
    return { score: 3, label: 'Good', color: 'bg-yellow-500', text: 'text-yellow-600', width: 'w-3/4' };
  }
  return { score: 4, label: 'Strong', color: 'bg-green-500', text: 'text-green-600', width: 'w-full' };
};

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [errorType, setErrorType] = useState(null); // 'expired' | 'invalid' | 'general'
  const [errorMessage, setErrorMessage] = useState('');

  // If no token: redirect to /forgot-password
  useEffect(() => {
    if (!token) {
      navigate('/forgot-password', { replace: true });
    }
  }, [token, navigate]);

  // Auto redirect countdown on success
  useEffect(() => {
    if (!isSuccess) return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate('/login', { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSuccess, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const passwordValue = watch('password', '');
  const strength = calculateStrength(passwordValue);

  const onSubmit = async (data) => {
    setErrorType(null);
    setErrorMessage('');

    try {
      await authService.resetPassword(token, data.password);
      setIsSuccess(true);
    } catch (error) {
      const msg = error.response?.data?.message || '';
      if (msg.toLowerCase().includes('expired')) {
        setErrorType('expired');
        setErrorMessage('This reset link has expired.');
      } else if (error.response?.status === 400 || msg.toLowerCase().includes('invalid')) {
        setErrorType('invalid');
        setErrorMessage('Invalid reset link.');
      } else {
        setErrorType('general');
        setErrorMessage(msg || 'Failed to reset password. Please try again.');
      }
    }
  };

  if (!token) return null;

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
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-md border border-gray-100">
          {!isSuccess ? (
            <>
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">
                Reset your password
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Choose a strong and secure password for your JobShield account.
              </p>

              {/* Expired Token Error */}
              {errorType === 'expired' && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-center">
                  <XCircleIcon className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold">{errorMessage}</p>
                  <Link
                    to="/forgot-password"
                    className="mt-3 inline-flex items-center justify-center py-2 px-4 text-xs font-bold rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    Request new link
                  </Link>
                </div>
              )}

              {/* Invalid Token Error */}
              {errorType === 'invalid' && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-center">
                  <XCircleIcon className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold">{errorMessage}</p>
                  <Link
                    to="/forgot-password"
                    className="mt-3 inline-flex items-center justify-center py-2 px-4 text-xs font-bold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    Request new link
                  </Link>
                </div>
              )}

              {/* General Error */}
              {errorType === 'general' && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
                  <ExclamationCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm font-medium">{errorMessage}</p>
                </div>
              )}

              {errorType !== 'expired' && errorType !== 'invalid' && (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                      New Password
                    </label>
                    <div className="relative rounded-lg shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <LockClosedIcon className="w-5 h-5" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="At least 8 characters"
                        {...register('password')}
                        className={`block w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                          errors.password ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator Bar */}
                    {passwordValue && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-500 font-medium">Password strength:</span>
                          <span className={`font-bold ${strength.text}`}>{strength.label}</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${strength.color} ${strength.width} transition-all duration-300 rounded-full`}
                          />
                        </div>
                      </div>
                    )}

                    {errors.password && (
                      <p className="mt-1 text-xs text-red-600 font-medium">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                      Confirm New Password
                    </label>
                    <div className="relative rounded-lg shadow-xs">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <LockClosedIcon className="w-5 h-5" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-enter your new password"
                        {...register('confirmPassword')}
                        className={`block w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                          errors.confirmPassword ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-300'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-600 font-medium">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center items-center py-2.5 px-4 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 mt-2"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Updating password...</span>
                      </div>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </form>
              )}
            </>
          ) : (
            <div className="text-center py-4 animate-fade-in">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-5">
                <CheckCircleIcon className="w-10 h-10 stroke-[1.5] animate-bounce" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">Password reset successfully!</h3>
              <p className="mt-2 text-sm text-gray-600">
                You can now log in with your new password.
              </p>
              <div className="mt-6 p-3 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold">
                Redirecting in {countdown}...
              </div>
              <div className="mt-6">
                <Link
                  to="/login"
                  className="w-full inline-flex justify-center items-center py-2.5 px-4 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
