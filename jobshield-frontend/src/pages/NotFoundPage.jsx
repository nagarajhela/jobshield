import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldExclamationIcon, HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';

export default function NotFoundPage() {
  const { user } = useAuth();

  useEffect(() => {
    document.title = 'Page Not Found | JobShield';
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle animated background elements */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-60 pointer-events-none animate-pulse-slow"></div>
      <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-indigo-100 rounded-full blur-3xl opacity-60 pointer-events-none animate-pulse-slow"></div>

      <div className="max-w-md w-full text-center relative z-10">
        {/* JobShield Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <ShieldExclamationIcon className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Large 404 Text */}
        <h1 className="text-8xl sm:text-9xl font-extrabold text-slate-300 tracking-widest select-none">
          404
        </h1>

        {/* Title & Message */}
        <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-slate-900">
          Page Not Found
        </h2>
        <p className="mt-2 text-slate-600 text-sm sm:text-base leading-relaxed">
          The page you are looking for does not exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm"
          >
            <HomeIcon className="w-4 h-4 mr-2" />
            Go Home
          </Link>

          {user && (
            <Link
              to="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition shadow-sm"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
