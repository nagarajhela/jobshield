import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

/**
 * @typedef {Object} User
 * @property {number|string} [userId] - Unique identifier of user
 * @property {string} email - Email address
 * @property {string} [firstName] - Given name
 * @property {string} [lastName] - Family name
 * @property {string} [phoneNumber] - Contact number
 * @property {string} [role] - User role: USER, ANALYST, or ADMIN
 * @property {string} [status] - Account status: ACTIVE, SUSPENDED, or BANNED
 * @property {boolean} [emailVerified] - Verification status
 */

/**
 * @typedef {Object} AuthContextType
 * @property {User|null} currentUser - Current authenticated user record
 * @property {string|null} token - JWT authentication token
 * @property {boolean} isLoading - Initializing auth state flag
 * @property {boolean} isAuthenticated - Whether user session is active
 * @property {boolean} isAdmin - Whether user possesses administrator privileges
 * @property {boolean} isAnalyst - Whether user possesses analyst privileges
 * @property {(email: string, password: string) => Promise<any>} login - Authenticate user
 * @property {(userData: any) => Promise<any>} register - Register new user account
 * @property {() => void} logout - Terminate user session and clear storage
 * @property {() => Promise<User|null>} refreshUser - Fetch updated user profile
 * @property {React.Dispatch<React.SetStateAction<User|null>>} setCurrentUser - Update user state
 */

/**
 * Custom hook to access authentication context.
 *
 * @returns {AuthContextType} Authentication context object
 * @throws {Error} Thrown if invoked outside an AuthProvider component
 *
 * @example
 * // Usage in a component:
 * const { currentUser, isAuthenticated, logout } = useAuth();
 * console.log('Current authenticated user:', currentUser?.email);
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider. Wrap your component tree with <AuthProvider>.');
  }

  return context;
};

export default useAuth;
