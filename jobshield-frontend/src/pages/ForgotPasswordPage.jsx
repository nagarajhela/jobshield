import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  ShieldCheckIcon,
  ArrowLeftIcon,
  EnvelopeIcon,
  EnvelopeOpenIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import authService from '../services/authService';

const schema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address'),
});

const ForgotPasswordPage = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data) => {
    setErrorMessage('');
    setSubmittedEmail(data.email);

    try {
      await authService.forgotPassword(data.email);
      setIsSuccess(true);
    } catch (error) {
      if (error.response?.status === 429) {
        setErrorMessage('Too many requests. Please wait before trying again.');
      } else {
        // For security, proceed to success view even if email not found or general error
        setIsSuccess(true);
      }
    }
  };

  const handleTryAgain = () => {
    setIsSuccess(false);
    setErrorMessage('');
    reset();
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
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-md border border-gray-100">
          {!isSuccess ? (
            <>
              <div className="mb-6">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors mb-4"
                >
                  <ArrowLeftIcon className="w-3.5 h-3.5" />
                  Back to Login
                </Link>
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  Forgot your password?
                </h2>
                <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">
                  Enter your email and we will send you a reset link.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
                  <ExclamationCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm font-medium">{errorMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                    Email address
                  </label>
                  <div className="relative rounded-lg shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <EnvelopeIcon className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      autoComplete="email"
                      placeholder="name@example.com"
                      {...register('email')}
                      className={`block w-full pl-10 pr-3 py-2.5 text-sm rounded-lg border bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                        errors.email ? 'border-red-400 ring-1 ring-red-400' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center items-center py-2.5 px-4 text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Sending reset link...</span>
                    </div>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4 animate-fade-in">
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
                <EnvelopeOpenIcon className="w-9 h-9 stroke-[1.5]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Reset link sent!</h3>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                If <span className="font-semibold text-gray-900">{submittedEmail}</span> is registered, you will receive a password reset link.
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Didn't receive it? Check spam folder.
              </p>
              <div className="mt-8 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleTryAgain}
                  className="w-full py-2.5 px-4 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
                >
                  Try again
                </button>
                <Link
                  to="/login"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
