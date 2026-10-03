import React from 'react';

const colorThemes = {
  blue: {
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    valueColor: 'text-gray-900',
    borderHover: 'hover:border-blue-200',
  },
  red: {
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
    valueColor: 'text-red-600',
    borderHover: 'hover:border-red-200',
  },
  yellow: {
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    valueColor: 'text-amber-600',
    borderHover: 'hover:border-amber-200',
  },
  green: {
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    valueColor: 'text-emerald-600',
    borderHover: 'hover:border-emerald-200',
  },
};

const StatsCard = ({
  title,
  value,
  icon: Icon,
  colorScheme = 'blue',
  subtext,
  loading = false,
}) => {
  const theme = colorThemes[colorScheme] || colorThemes.blue;

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-md border border-gray-100 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-200" />
          <div className="w-6 h-3 bg-gray-100 rounded" />
        </div>
        <div className="h-8 w-16 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-28 bg-gray-100 rounded mb-3" />
        <div className="h-3 w-36 bg-gray-100 rounded" />
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl p-5 shadow-md border border-gray-100 transition-all duration-200 ${theme.borderHover}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-full ${theme.iconBg} ${theme.iconColor} flex items-center justify-center`}>
          {Icon && <Icon className="w-5 h-5 stroke-[2]" />}
        </div>
      </div>

      <div className={`text-3xl font-black tracking-tight ${theme.valueColor}`}>
        {value ?? 0}
      </div>

      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mt-1">
        {title}
      </h4>

      {subtext && (
        <p className="text-xs text-gray-500 mt-2 font-medium">
          {subtext}
        </p>
      )}
    </div>
  );
};

export default StatsCard;
