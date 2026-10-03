import {
  format,
  isValid,
  isToday,
  isYesterday,
  isThisWeek,
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
} from 'date-fns';

/**
 * Safely parses any date input into a valid Date object.
 *
 * @param {string | number | Date | null | undefined} input - Date input to parse
 * @returns {Date | null} Parsed Date or null if invalid
 */
function parseDateSafely(input) {
  if (!input) return null;
  const date = input instanceof Date ? input : new Date(input);
  return isValid(date) ? date : null;
}

/**
 * Formats a date string into standard readable date.
 * Example output: "Sep 22, 2026"
 *
 * @param {string | number | Date | null | undefined} dateString - Raw date input
 * @returns {string} Formatted date or fallback dash
 *
 * @example
 * console.log(formatDate("2026-09-22T10:30:00Z")); // "Sep 22, 2026"
 */
export function formatDate(dateString) {
  const date = parseDateSafely(dateString);
  if (!date) return '—';
  try {
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    console.warn('formatDate: Failed to format date:', error);
    return '—';
  }
}

/**
 * Formats a date string into a readable date and time string.
 * Example output: "Sep 22, 2026 at 10:30 AM"
 *
 * @param {string | number | Date | null | undefined} dateString - Raw date input
 * @returns {string} Formatted date time or fallback dash
 *
 * @example
 * console.log(formatDateTime("2026-09-22T10:30:00Z")); // "Sep 22, 2026 at 10:30 AM"
 */
export function formatDateTime(dateString) {
  const date = parseDateSafely(dateString);
  if (!date) return '—';
  try {
    return format(date, "MMM d, yyyy 'at' h:mm a");
  } catch (error) {
    console.warn('formatDateTime: Failed to format datetime:', error);
    return '—';
  }
}

/**
 * Formats a date string into relative time ago.
 * Rules:
 *  - Under 60 seconds: "Just now"
 *  - Under 60 minutes: "X minute(s) ago"
 *  - Under 24 hours: "X hour(s) ago"
 *  - Under 7 days: "X day(s) ago"
 *  - 7+ days: Fallback to formatDate(dateString) ("Sep 22, 2026")
 *
 * @param {string | number | Date | null | undefined} dateString - Raw date input
 * @returns {string} Relative time ago string
 *
 * @example
 * console.log(formatTimeAgo(new Date(Date.now() - 1000 * 60 * 5))); // "5 minutes ago"
 * console.log(formatTimeAgo(new Date(Date.now() - 1000 * 20))); // "Just now"
 */
export function formatTimeAgo(dateString) {
  const date = parseDateSafely(dateString);
  if (!date) return '—';

  try {
    const now = new Date();
    const diffSeconds = Math.max(0, differenceInSeconds(now, date));
    const diffMinutes = Math.max(0, differenceInMinutes(now, date));
    const diffHours = Math.max(0, differenceInHours(now, date));
    const diffDays = Math.max(0, differenceInDays(now, date));

    if (diffSeconds < 60) {
      return 'Just now';
    }
    if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    }
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    }
    if (diffDays <= 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    }

    return formatDate(date);
  } catch (error) {
    console.warn('formatTimeAgo: Failed to compute relative time:', error);
    return formatDate(date);
  }
}

/**
 * Formats a date string into short standard format DD/MM/YYYY.
 * Example output: "22/09/2026"
 *
 * @param {string | number | Date | null | undefined} dateString - Raw date input
 * @returns {string} Short date string or fallback dash
 *
 * @example
 * console.log(formatShortDate("2026-09-22T10:30:00Z")); // "22/09/2026"
 */
export function formatShortDate(dateString) {
  const date = parseDateSafely(dateString);
  if (!date) return '—';
  try {
    return format(date, 'dd/MM/yyyy');
  } catch (error) {
    console.warn('formatShortDate: Failed to format short date:', error);
    return '—';
  }
}

/**
 * Groups an array of objects by date into predefined buckets:
 * today, yesterday, thisWeek, older.
 *
 * @template T
 * @param {T[]} items - Array of items to group
 * @param {keyof T | string} [dateField='createdAt'] - Property name containing the date string/object
 * @returns {{ today: T[], yesterday: T[], thisWeek: T[], older: T[] }} Grouped items object
 *
 * @example
 * const notifications = [
 *   { id: 1, title: 'Alert 1', createdAt: new Date() },
 *   { id: 2, title: 'Alert 2', createdAt: '2026-01-01' }
 * ];
 * const grouped = groupByDate(notifications, 'createdAt');
 * console.log('Today:', grouped.today.length, 'Older:', grouped.older.length);
 */
export function groupByDate(items, dateField = 'createdAt') {
  const result = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: [],
  };

  if (!Array.isArray(items)) {
    return result;
  }

  items.forEach((item) => {
    if (!item) return;
    const rawDate = item[dateField] ?? item.created_at ?? item.timestamp ?? item.date;
    const date = parseDateSafely(rawDate);

    if (!date) {
      result.older.push(item);
      return;
    }

    try {
      if (isToday(date)) {
        result.today.push(item);
      } else if (isYesterday(date)) {
        result.yesterday.push(item);
      } else if (isThisWeek(date, { weekStartsOn: 1 })) {
        result.thisWeek.push(item);
      } else {
        result.older.push(item);
      }
    } catch {
      result.older.push(item);
    }
  });

  return result;
}

export default {
  formatDate,
  formatDateTime,
  formatTimeAgo,
  formatShortDate,
  groupByDate,
};
