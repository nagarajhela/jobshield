import * as yup from 'yup';

/**
 * Validation schema collection using Yup for forms across JobShield.
 */

// Regex for Malaysian phone numbers (e.g., +6012-3456789, 0123456789, +60111234567)
export const MALAYSIAN_PHONE_REGEX = /^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/;

// Regex for standard URL validation
export const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;

/**
 * Helper to validate optional phone number with Malaysian format if provided.
 */
const optionalMalaysianPhone = yup
  .string()
  .trim()
  .transform((val) => (val === '' ? null : val))
  .nullable()
  .test('is-my-phone', 'Invalid Malaysian phone format (e.g. +60123456789 or 012-3456789)', (val) => {
    if (!val) return true; // Optional
    const sanitized = val.replace(/[\s-]/g, '');
    return /^(\+?601|01)[0-46-9][0-9]{7,8}$/.test(sanitized);
  });

/**
 * Login validation schema.
 */
export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .required('Email address is required')
    .email('Please enter a valid email address'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

/**
 * User registration validation schema.
 */
export const registerSchema = yup.object().shape({
  firstName: yup
    .string()
    .trim()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters'),
  lastName: yup
    .string()
    .trim()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters'),
  email: yup
    .string()
    .trim()
    .required('Email address is required')
    .email('Please enter a valid email address'),
  phoneNumber: optionalMalaysianPhone,
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
});

/**
 * Forgot password request validation schema.
 */
export const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .trim()
    .required('Email address is required')
    .email('Please enter a valid email address'),
});

/**
 * Reset password validation schema with token.
 */
export const resetPasswordSchema = yup.object().shape({
  password: yup
    .string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
});

/**
 * Change password validation schema for user settings.
 */
export const changePasswordSchema = yup.object().shape({
  currentPassword: yup
    .string()
    .required('Current password is required'),
  newPassword: yup
    .string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number'),
  confirmNewPassword: yup
    .string()
    .required('Please confirm your new password')
    .oneOf([yup.ref('newPassword')], 'Passwords do not match'),
});

/**
 * Manual job analysis input validation schema.
 */
export const jobAnalysisSchema = yup.object().shape({
  companyName: yup
    .string()
    .trim()
    .required('Company name is required')
    .min(2, 'Company name must be at least 2 characters')
    .max(255, 'Company name cannot exceed 255 characters'),
  jobTitle: yup
    .string()
    .trim()
    .required('Job title is required')
    .min(2, 'Job title must be at least 2 characters')
    .max(255, 'Job title cannot exceed 255 characters'),
  salary: yup
    .string()
    .trim()
    .max(100, 'Salary range description cannot exceed 100 characters')
    .nullable()
    .notRequired(),
  jobDescription: yup
    .string()
    .trim()
    .required('Job description is required')
    .min(50, 'Job description must be at least 50 characters for accurate AI analysis')
    .max(5000, 'Job description cannot exceed 5000 characters'),
});

/**
 * Report community scam job validation schema.
 */
export const reportScamSchema = yup.object().shape({
  companyName: yup
    .string()
    .trim()
    .required('Company name is required')
    .min(2, 'Company name must be at least 2 characters')
    .max(255, 'Company name cannot exceed 255 characters'),
  jobTitle: yup
    .string()
    .trim()
    .required('Job title is required')
    .min(2, 'Job title must be at least 2 characters')
    .max(255, 'Job title cannot exceed 255 characters'),
  platform: yup
    .string()
    .trim()
    .required('Platform source is required'),
  jobUrl: yup
    .string()
    .trim()
    .transform((val) => (val === '' ? null : val))
    .nullable()
    .matches(URL_REGEX, { message: 'Must be a valid web URL starting with http:// or https://', excludeEmptyString: true }),
  description: yup
    .string()
    .trim()
    .required('Scam incident description is required')
    .min(50, 'Please provide at least 50 characters describing what occurred')
    .max(2000, 'Description cannot exceed 2000 characters'),
  termsAccepted: yup
    .boolean()
    .oneOf([true], 'You must certify that the reported information is truthful to the best of your knowledge'),
});

/**
 * Profile details update validation schema.
 */
export const profileUpdateSchema = yup.object().shape({
  firstName: yup
    .string()
    .trim()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters'),
  lastName: yup
    .string()
    .trim()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters'),
  phoneNumber: optionalMalaysianPhone,
});

/**
 * URL Scanner analysis validation schema.
 */
export const urlAnalysisSchema = yup.object().shape({
  url: yup
    .string()
    .trim()
    .required('Job posting URL is required')
    .matches(URL_REGEX, 'Must be a valid web URL (e.g. https://www.linkedin.com/jobs/...)'),
});

export default {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  jobAnalysisSchema,
  reportScamSchema,
  profileUpdateSchema,
  urlAnalysisSchema,
};
