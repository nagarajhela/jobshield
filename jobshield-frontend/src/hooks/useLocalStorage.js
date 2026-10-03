import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage persistent state synchronized with browser localStorage.
 * Handles serialization, JSON parsing errors gracefully, and responds to cross-tab storage changes.
 *
 * @template T
 * @param {string} key - Storage key name
 * @param {T | (() => T)} initialValue - Default value if key does not exist
 * @returns {[T, (value: T | ((val: T) => T)) => void, () => void]} [storedValue, setValue, removeValue]
 *
 * @example
 * const [userToken, setUserToken, removeToken] = useLocalStorage('jobshield_token', null);
 * console.log('Current token:', userToken);
 * setUserToken('abc-123-xyz');
 */
export function useLocalStorage(key, initialValue) {
  if (!key || typeof key !== 'string') {
    throw new Error('useLocalStorage: A valid string key is required.');
  }

  // Helper to read current item from localStorage safely
  const readValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return typeof initialValue === 'function' ? initialValue() : initialValue;
    }

    try {
      const rawItem = window.localStorage.getItem(key);
      if (rawItem === null || rawItem === undefined) {
        return typeof initialValue === 'function' ? initialValue() : initialValue;
      }
      return JSON.parse(rawItem);
    } catch (error) {
      console.warn(`useLocalStorage: Error parsing item for key "${key}":`, error);
      return typeof initialValue === 'function' ? initialValue() : initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState(readValue);

  // Return a wrapped version of useState's setter that persists to localStorage
  const setValue = useCallback((value) => {
    if (typeof window === 'undefined') {
      console.warn(`useLocalStorage: Cannot set key "${key}" outside browser environment.`);
      return;
    }

    try {
      setStoredValue((currentValue) => {
        const valueToStore = typeof value === 'function' ? value(currentValue) : value;
        try {
          if (valueToStore === undefined) {
            window.localStorage.removeItem(key);
          } else {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          }
        } catch (error) {
          console.error(`useLocalStorage: Error setting key "${key}":`, error);
        }
        return valueToStore;
      });
    } catch (error) {
      console.error(`useLocalStorage: Error updating state for key "${key}":`, error);
    }
  }, [key]);

  // Remove helper to clear item from storage and reset to initialValue
  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
      const fallback = typeof initialValue === 'function' ? initialValue() : initialValue;
      setStoredValue(fallback);
    } catch (error) {
      console.error(`useLocalStorage: Error removing key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Synchronize across tabs via the 'storage' event
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === key && event.storageArea === window.localStorage) {
        setStoredValue(readValue());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, readValue]);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
