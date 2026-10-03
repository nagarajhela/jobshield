import { useState, useEffect } from 'react';

/**
 * Custom hook that delays updating a value until after a specified timeout period.
 * Useful for debouncing user inputs in search bars and API queries.
 *
 * @template T
 * @param {T} value - The dynamic value to debounce
 * @param {number} [delay=500] - Delay in milliseconds
 * @returns {T} Debounced value that updates only after delay
 *
 * @example
 * // Usage in search component:
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 500);
 * useEffect(() => {
 *   console.log('Debounced search query to query API with:', debouncedSearch);
 * }, [debouncedSearch]);
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
