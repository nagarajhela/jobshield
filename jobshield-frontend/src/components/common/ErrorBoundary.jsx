import React from 'react';
import { ShieldExclamationIcon, ArrowPathIcon, HomeIcon } from '@heroicons/react/24/outline';

/**
 * Top-level ErrorBoundary class component to catch unhandled runtime React render exceptions.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    }
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;

      return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl shadow-card border border-slate-100">
            {/* JobShield Logo */}
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center text-rose-600 shadow-sm">
                <ShieldExclamationIcon className="w-10 h-10" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              An unexpected error occurred while rendering this view. Please try refreshing or returning to the home page.
            </p>

            {/* Error Message Details (Dev Mode Only) */}
            {isDev && this.state.error && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-left overflow-x-auto text-xs font-mono text-rose-800 max-h-40">
                {this.state.error.toString()}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleRefresh}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition shadow-sm"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Refresh Page
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition shadow-sm"
              >
                <HomeIcon className="w-4 h-4 mr-2" />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
