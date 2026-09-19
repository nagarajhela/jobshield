import React from 'react';

/**
 * RiskBadge Component
 * Renders a standardized badge for HIGH, MEDIUM, and LOW risk levels.
 */
export default function RiskBadge({ level }) {
  const safeLevel = (level || 'LOW').toUpperCase();

  let badgeClass = 'badge-low';
  let icon = '✓';

  if (safeLevel === 'HIGH') {
    badgeClass = 'badge-high';
    icon = '⚠';
  } else if (safeLevel === 'MEDIUM') {
    badgeClass = 'badge-medium';
    icon = '⚡';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      <span>{icon}</span>
      <span>{safeLevel} RISK</span>
    </span>
  );
}
