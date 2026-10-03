import React from 'react';

const RiskBadge = ({ level = 'LOW', size = 'md' }) => {
  const normalizedLevel = (level || 'LOW').toUpperCase();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  }[size] || 'text-xs px-2.5 py-1 font-semibold';

  let colorClasses;
  let label;

  if (normalizedLevel === 'HIGH' || normalizedLevel.includes('HIGH')) {
    colorClasses = 'bg-red-100 text-red-800 border border-red-300';
    label = 'HIGH RISK';
  } else if (normalizedLevel === 'MEDIUM' || normalizedLevel.includes('MED')) {
    colorClasses = 'bg-amber-100 text-amber-800 border border-amber-300';
    label = 'MEDIUM RISK';
  } else {
    colorClasses = 'bg-emerald-100 text-emerald-800 border border-emerald-300';
    label = 'LOW RISK';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full transition-all duration-200 uppercase tracking-wider ${sizeClasses} ${colorClasses}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          label === 'HIGH RISK'
            ? 'bg-red-500'
            : label === 'MEDIUM RISK'
            ? 'bg-amber-500'
            : 'bg-emerald-500'
        }`}
      />
      {label}
    </span>
  );
};

export default RiskBadge;
