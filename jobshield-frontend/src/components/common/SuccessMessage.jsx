import React from 'react';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

const SuccessMessage = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="flex items-start justify-between gap-3 p-3.5 bg-green-50 border border-green-200 text-green-700 rounded-lg shadow-sm transition-all duration-200">
      <div className="flex items-center gap-2.5">
        <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
        <p className="text-sm font-medium leading-5">{message}</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-green-400 hover:text-green-600 transition-colors p-0.5 rounded focus:outline-none"
          aria-label="Dismiss message"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SuccessMessage;
