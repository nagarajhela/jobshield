/**
 * Utility functions for evaluating password complexity, strength scores,
 * interactive strength meters, and requirement checklists.
 */

/**
 * Calculates a password strength score from 0 to 4 based on complexity criteria.
 *
 * Scoring logic:
 *  - 0: Empty or null
 *  - 1: Weak (< 6 characters)
 *  - 2: Fair (6+ characters)
 *  - 3: Good (8+ characters AND [number OR uppercase])
 *  - 4: Strong (8+ characters AND number AND uppercase AND special character)
 *
 * @param {string | null | undefined} password - Raw password string
 * @returns {0 | 1 | 2 | 3 | 4} Strength score
 *
 * @example
 * console.log(calculateStrength("Secret123!")); // 4
 * console.log(calculateStrength("pass")); // 1
 */
export function calculateStrength(password) {
  if (!password || typeof password !== 'string' || password.length === 0) {
    return 0;
  }

  const length = password.length;
  const hasUpper = /[A-Z]/.test(password);
  const hasNum = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (length < 6) {
    return 1;
  }

  // Check for Strong criteria
  if (length >= 8 && hasUpper && hasNum && hasSpecial) {
    return 4;
  }

  // Check for Good criteria
  if (length >= 8 && (hasUpper || hasNum)) {
    return 3;
  }

  // Fallback for 6+ chars
  return 2;
}

/**
 * Returns human-readable label for a strength score.
 *
 * @param {number | null | undefined} score - Score 0 to 4
 * @returns {"" | "Weak" | "Fair" | "Good" | "Strong"} Descriptive strength label
 *
 * @example
 * console.log(getStrengthLabel(4)); // "Strong"
 */
export function getStrengthLabel(score) {
  switch (score) {
    case 1:
      return 'Weak';
    case 2:
      return 'Fair';
    case 3:
      return 'Good';
    case 4:
      return 'Strong';
    case 0:
    default:
      return '';
  }
}

/**
 * Returns Tailwind background color class for the strength meter.
 *
 * @param {number | null | undefined} score - Score 0 to 4
 * @returns {string} Tailwind bg class
 *
 * @example
 * console.log(getStrengthColor(3)); // "bg-yellow-500"
 */
export function getStrengthColor(score) {
  switch (score) {
    case 1:
      return 'bg-red-500';
    case 2:
      return 'bg-orange-500';
    case 3:
      return 'bg-yellow-500';
    case 4:
      return 'bg-green-500';
    case 0:
    default:
      return 'bg-gray-200';
  }
}

/**
 * Returns Tailwind width class for the strength meter bar.
 *
 * @param {number | null | undefined} score - Score 0 to 4
 * @returns {string} Tailwind width class
 *
 * @example
 * console.log(getStrengthWidth(4)); // "w-full"
 */
export function getStrengthWidth(score) {
  switch (score) {
    case 1:
      return 'w-1/4';
    case 2:
      return 'w-2/4';
    case 3:
      return 'w-3/4';
    case 4:
      return 'w-full';
    case 0:
    default:
      return 'w-0';
  }
}

/**
 * Evaluates discrete password requirements checklist.
 *
 * @param {string | null | undefined} password - Raw password string
 * @returns {{
 *   minLength: boolean,
 *   hasUppercase: boolean,
 *   hasNumber: boolean,
 *   hasSpecial: boolean
 * }} Requirements status object
 *
 * @example
 * const reqs = getRequirements("Test1234");
 * console.log(reqs.minLength, reqs.hasSpecial); // true, false
 */
export function getRequirements(password) {
  const safePassword = typeof password === 'string' ? password : '';

  return {
    minLength: safePassword.length >= 8,
    hasUppercase: /[A-Z]/.test(safePassword),
    hasNumber: /[0-9]/.test(safePassword),
    hasSpecial: /[^A-Za-z0-9]/.test(safePassword),
  };
}

export default {
  calculateStrength,
  getStrengthLabel,
  getStrengthColor,
  getStrengthWidth,
  getRequirements,
};
