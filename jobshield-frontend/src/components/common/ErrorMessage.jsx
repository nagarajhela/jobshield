import React from 'react';
import { ExclamationCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

const ErrorMessage = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="flex items-start justify-between gap-3 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm transition-all duration-200">
      <div className="flex items-center gap-2.5">
        <ExclamationCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
        <p className="text-sm font-medium leading-5">{message}</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-red-400 hover:text-red-600 transition-colors p-0.5 rounded focus:outline-none"
          aria-label="Dismiss error"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
