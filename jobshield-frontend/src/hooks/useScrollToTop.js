import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook that automatically resets window scroll position to the top
 * whenever the current route pathname changes.
 *
 * @param {'auto' | 'smooth' | 'instant'} [behavior='instant'] - Scroll behavior option
 * @returns {void}
 *
 * @example
 * // In App.jsx or RootLayout component:
 * function App() {
 *   useScrollToTop();
 *   console.log('Scroll restoration initialized on route transition');
 *   return <RouterOutlet />;
 * }
 */
export function useScrollToTop(behavior = 'instant') {
  const { pathname } = useLocation();

  useEffect(() => {
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior,
      });
    } catch {
      // Fallback for older browsers
      window.scrollTo(0, 0);
    }
  }, [pathname, behavior]);
}

export default useScrollToTop;
