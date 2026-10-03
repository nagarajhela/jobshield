import React from 'react';
import { InboxIcon } from '@heroicons/react/24/outline';

const EmptyState = ({
  icon: Icon = InboxIcon,
  title = 'No data found',
  message = 'There is currently nothing to display here.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-2xl border border-dashed border-gray-300">
      <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl mb-4">
        <Icon className="w-10 h-10 stroke-[1.5]" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-6 leading-relaxed">
        {message}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
