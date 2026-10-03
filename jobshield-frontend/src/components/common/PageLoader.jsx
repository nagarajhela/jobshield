import React from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/solid';

/**
 * Full screen loading screen displayed during auth verification and critical data loads.
 */
export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50">
      <div className="relative flex items-center justify-center">
        {/* Subtle spinning ring around logo */}
        <div className="w-24 h-24 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin"></div>

        {/* Centered Logo with Animated Pulse */}
        <div className="absolute w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 animate-pulse">
          <ShieldCheckIcon className="w-8 h-8 text-white" />
        </div>
      </div>

      {/* Loading text */}
      <p className="mt-6 text-sm font-medium tracking-wide text-slate-600 animate-pulse">
        Loading...
      </p>
    </div>
  );
}
