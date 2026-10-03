/**
 * Application-wide constants, enum definitions, configuration limits,
 * and storage keys for JobShield frontend.
 */

/**
 * Supported risk levels evaluated by the AI analysis engine.
 * @type {readonly ['LOW', 'MEDIUM', 'HIGH']}
 */
export const RISK_LEVELS = Object.freeze(['LOW', 'MEDIUM', 'HIGH']);

/**
 * Recognizable fraud and scam patterns identified in job postings.
 * @type {readonly string[]}
 */
export const SCAM_PATTERNS = Object.freeze([
  'ADVANCE_FEE',
  'PHISHING',
  'FAKE_RECRUITER',
  'MLM_PYRAMID',
  'DATA_HARVESTING',
  'UNPAID_TRIAL',
  'IDENTITY_THEFT',
  'NONE',
]);

/**
 * Common job listing and communication platforms.
 * @type {readonly string[]}
 */
export const PLATFORMS = Object.freeze([
  'LinkedIn',
  'Indeed',
  'JobStreet',
  'Glassdoor',
  'Telegram',
  'WhatsApp',
  'Facebook',
  'Other',
]);

/**
 * User authorization roles.
 * @type {readonly ['USER', 'ANALYST', 'ADMIN']}
 */
export const USER_ROLES = Object.freeze(['USER', 'ANALYST', 'ADMIN']);

/**
 * Account operational statuses.
 * @type {readonly ['ACTIVE', 'SUSPENDED', 'BANNED']}
 */
export const ACCOUNT_STATUSES = Object.freeze([
  'ACTIVE',
  'SUSPENDED',
  'BANNED',
]);

/**
 * Notification event types pushed to users.
 * @type {readonly string[]}
 */
export const NOTIFICATION_TYPES = Object.freeze([
  'HIGH_RISK_DETECTED',
  'NEW_CAMPAIGN',
  'SECURITY_ALERT',
  'SYSTEM_INFO',
]);

/**
 * Severity ranking levels for alerts and reports.
 * @type {readonly ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']}
 */
export const SEVERITY_LEVELS = Object.freeze([
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
]);

/**
 * Input source ingestion methods for job analyses.
 * @type {readonly ['MANUAL', 'URL_SCAN', 'PDF_UPLOAD']}
 */
export const SOURCE_TYPES = Object.freeze([
  'MANUAL',
  'URL_SCAN',
  'PDF_UPLOAD',
]);

/**
 * Subscription plan tiers.
 * @type {readonly ['FREE', 'PREMIUM', 'ENTERPRISE']}
 */
export const PLAN_TYPES = Object.freeze(['FREE', 'PREMIUM', 'ENTERPRISE']);

/**
 * Default backend API Base URL.
 * Falls back to environment variable if configured.
 * @type {string}
 */
export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  'http://localhost:8081';

/**
 * Key name for storing JWT authentication token in localStorage/cookies.
 * @type {string}
 */
export const TOKEN_KEY = 'jobshield_token';

/**
 * Key name for storing active user profile details in localStorage.
 * @type {string}
 */
export const USER_KEY = 'jobshield_user';

/**
 * Maximum character count accepted for job descriptions.
 * @type {number}
 */
export const MAX_DESCRIPTION_LENGTH = 5000;

/**
 * Maximum permissible file size in Megabytes for PDF uploads.
 * @type {number}
 */
export const MAX_FILE_SIZE_MB = 5;

/**
 * Standard debounce delay in milliseconds for search and filter inputs.
 * @type {number}
 */
export const DEBOUNCE_DELAY = 500;

/**
 * Polling interval in milliseconds for unread notification count.
 * @type {number}
 */
export const NOTIFICATION_POLL_INTERVAL = 30000;

/**
 * Session inactivity timeout in minutes.
 * @type {number}
 */
export const SESSION_TIMEOUT_MINUTES = 30;

export default {
  RISK_LEVELS,
  SCAM_PATTERNS,
  PLATFORMS,
  USER_ROLES,
  ACCOUNT_STATUSES,
  NOTIFICATION_TYPES,
  SEVERITY_LEVELS,
  SOURCE_TYPES,
  PLAN_TYPES,
  API_BASE_URL,
  TOKEN_KEY,
  USER_KEY,
  MAX_DESCRIPTION_LENGTH,
  MAX_FILE_SIZE_MB,
  DEBOUNCE_DELAY,
  NOTIFICATION_POLL_INTERVAL,
  SESSION_TIMEOUT_MINUTES,
};
