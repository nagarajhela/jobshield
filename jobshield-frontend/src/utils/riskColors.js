/**
 * Utility functions for risk visualization, color mapping, severity tagging,
 * and scam pattern badges across the JobShield application.
 */

/**
 * Normalizes risk or severity level strings to uppercase trimmed format.
 *
 * @param {string | null | undefined} val - Raw input
 * @returns {string} Normalized string or 'UNKNOWN'
 */
function normalizeLevel(val) {
  if (!val || typeof val !== 'string') return 'UNKNOWN';
  return val.trim().toUpperCase();
}

/**
 * Returns Tailwind background CSS class based on risk level.
 *
 * @param {'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string | null | undefined} level - Risk level
 * @returns {string} Tailwind background class
 *
 * @example
 * console.log(getRiskBgColor('HIGH')); // "bg-rose-50 dark:bg-rose-950/40"
 */
export function getRiskBgColor(level) {
  const normalized = normalizeLevel(level);
  switch (normalized) {
    case 'LOW':
    case 'SAFE':
      return 'bg-emerald-50 dark:bg-emerald-950/40';
    case 'MEDIUM':
    case 'MODERATE':
      return 'bg-amber-50 dark:bg-amber-950/40';
    case 'HIGH':
      return 'bg-orange-50 dark:bg-orange-950/40';
    case 'CRITICAL':
      return 'bg-rose-50 dark:bg-rose-950/40';
    default:
      return 'bg-slate-50 dark:bg-slate-800/40';
  }
}

/**
 * Returns Tailwind text color CSS class based on risk level.
 *
 * @param {'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string | null | undefined} level - Risk level
 * @returns {string} Tailwind text color class
 *
 * @example
 * console.log(getRiskTextColor('LOW')); // "text-emerald-700 dark:text-emerald-400"
 */
export function getRiskTextColor(level) {
  const normalized = normalizeLevel(level);
  switch (normalized) {
    case 'LOW':
    case 'SAFE':
      return 'text-emerald-700 dark:text-emerald-400';
    case 'MEDIUM':
    case 'MODERATE':
      return 'text-amber-700 dark:text-amber-400';
    case 'HIGH':
      return 'text-orange-700 dark:text-orange-400';
    case 'CRITICAL':
      return 'text-rose-700 dark:text-rose-400';
    default:
      return 'text-slate-700 dark:text-slate-300';
  }
}

/**
 * Returns Tailwind border CSS class based on risk level.
 *
 * @param {'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string | null | undefined} level - Risk level
 * @returns {string} Tailwind border color class
 *
 * @example
 * console.log(getRiskBorderColor('MEDIUM')); // "border-amber-200 dark:border-amber-800"
 */
export function getRiskBorderColor(level) {
  const normalized = normalizeLevel(level);
  switch (normalized) {
    case 'LOW':
    case 'SAFE':
      return 'border-emerald-200 dark:border-emerald-800';
    case 'MEDIUM':
    case 'MODERATE':
      return 'border-amber-200 dark:border-amber-800';
    case 'HIGH':
      return 'border-orange-200 dark:border-orange-800';
    case 'CRITICAL':
      return 'border-rose-200 dark:border-rose-800';
    default:
      return 'border-slate-200 dark:border-slate-700';
  }
}

/**
 * Returns color classes or hex based on numeric risk score (0-100).
 * Thresholds:
 *  - 0-30: Low / Safe (Emerald)
 *  - 31-60: Medium / Caution (Amber)
 *  - 61-80: High (Orange)
 *  - 81-100: Critical (Rose)
 *
 * @param {number | string | null | undefined} score - Numeric score 0 to 100
 * @returns {string} Tailwind color representation
 *
 * @example
 * console.log(getRiskScoreColor(85)); // "text-rose-600 dark:text-rose-400"
 */
export function getRiskScoreColor(score) {
  const num = typeof score === 'number' ? score : parseFloat(score);
  if (isNaN(num)) return 'text-slate-500 dark:text-slate-400';

  if (num <= 30) {
    return 'text-emerald-600 dark:text-emerald-400';
  }
  if (num <= 60) {
    return 'text-amber-600 dark:text-amber-400';
  }
  if (num <= 80) {
    return 'text-orange-600 dark:text-orange-400';
  }
  return 'text-rose-600 dark:text-rose-400';
}

/**
 * Returns Tailwind linear gradient classes based on risk level.
 *
 * @param {'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string | null | undefined} level - Risk level
 * @returns {string} Tailwind gradient classes
 *
 * @example
 * console.log(getRiskGradient('HIGH')); // "from-orange-500 to-rose-600 text-white"
 */
export function getRiskGradient(level) {
  const normalized = normalizeLevel(level);
  switch (normalized) {
    case 'LOW':
    case 'SAFE':
      return 'from-emerald-500 to-teal-600 text-white';
    case 'MEDIUM':
    case 'MODERATE':
      return 'from-amber-500 to-orange-500 text-white';
    case 'HIGH':
      return 'from-orange-500 to-rose-600 text-white';
    case 'CRITICAL':
      return 'from-rose-600 to-red-700 text-white';
    default:
      return 'from-slate-600 to-slate-800 text-white';
  }
}

/**
 * Returns color classes for severity levels: CRITICAL, HIGH, MEDIUM, LOW.
 *
 * @param {'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string | null | undefined} severity - Severity level
 * @returns {string} Tailwind CSS badge classes (background, text, border)
 *
 * @example
 * console.log(getSeverityColor('CRITICAL')); // "bg-red-100 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-300"
 */
export function getSeverityColor(severity) {
  const normalized = normalizeLevel(severity);
  switch (normalized) {
    case 'CRITICAL':
      return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800';
    case 'HIGH':
      return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800';
    case 'MEDIUM':
      return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
    case 'LOW':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  }
}

/**
 * Returns an emoji icon representation for a given scam pattern.
 *
 * @param {string | null | undefined} pattern - Scam pattern identifier
 * @returns {string} Emoji icon
 *
 * @example
 * console.log(getScamPatternIcon('PHISHING')); // "🎣"
 */
export function getScamPatternIcon(pattern) {
  const normalized = normalizeLevel(pattern);
  switch (normalized) {
    case 'ADVANCE_FEE':
      return '💰';
    case 'PHISHING':
      return '🎣';
    case 'FAKE_RECRUITER':
      return '🎭';
    case 'MLM_PYRAMID':
      return '🔺';
    case 'DATA_HARVESTING':
      return '📊';
    case 'UNPAID_TRIAL':
      return '⏳';
    case 'IDENTITY_THEFT':
      return '🪪';
    case 'NONE':
      return '🛡️';
    default:
      return '⚠️';
  }
}

/**
 * Returns a human-friendly readable label for a scam pattern key.
 *
 * @param {string | null | undefined} pattern - Scam pattern identifier
 * @returns {string} Human readable label
 *
 * @example
 * console.log(getScamPatternLabel('ADVANCE_FEE')); // "Advance Fee Fraud"
 */
export function getScamPatternLabel(pattern) {
  const normalized = normalizeLevel(pattern);
  switch (normalized) {
    case 'ADVANCE_FEE':
      return 'Advance Fee Fraud';
    case 'PHISHING':
      return 'Credential Phishing';
    case 'FAKE_RECRUITER':
      return 'Recruiter Impersonation';
    case 'MLM_PYRAMID':
      return 'Multi-Level Marketing / Pyramid';
    case 'DATA_HARVESTING':
      return 'Personal Data Harvesting';
    case 'UNPAID_TRIAL':
      return 'Unpaid Labor / Task Scam';
    case 'IDENTITY_THEFT':
      return 'Identity Theft Risk';
    case 'NONE':
      return 'No Detected Scam Pattern';
    default:
      return pattern ? pattern.replace(/_/g, ' ') : 'Unknown Pattern';
  }
}

export default {
  getRiskBgColor,
  getRiskTextColor,
  getRiskBorderColor,
  getRiskScoreColor,
  getRiskGradient,
  getSeverityColor,
  getScamPatternIcon,
  getScamPatternLabel,
};
