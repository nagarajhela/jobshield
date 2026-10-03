import { useEffect } from 'react';

/**
 * Custom hook that alerts/triggers a callback when clicks or touch events occur outside of the passed ref element.
 * Commonly used for closing modals, dropdowns, and flyout navigation menus.
 *
 * @param {import('react').RefObject<HTMLElement | null>} ref - React ref attached to the target element
 * @param {(event: MouseEvent | TouchEvent) => void} handler - Callback triggered when clicking outside
 * @param {boolean} [enabled=true] - Optional boolean flag to conditionally enable or disable the listener
 * @returns {void}
 *
 * @example
 * const dropdownRef = useRef(null);
 * useClickOutside(dropdownRef, () => {
 *   console.log('Clicked outside dropdown! Closing menu.');
 *   setIsOpen(false);
 * });
 */
export function useClickOutside(ref, handler, enabled = true) {
  useEffect(() => {
    if (!enabled || typeof handler !== 'function') return;

    const listener = (event) => {
      // Do nothing if clicking ref's element or descendent elements
      const target = event.target;
      if (!ref || !ref.current || (target instanceof Node && ref.current.contains(target))) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, enabled]);
}

export default useClickOutside;
