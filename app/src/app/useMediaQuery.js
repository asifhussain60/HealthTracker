/**
 * useMediaQuery.js — viewport-width hook
 * AC-P1C-C2
 *
 * Returns true when the media query matches.
 * Falls back to false in environments without matchMedia (SSR, some test setups).
 */
import { useState, useEffect } from 'react';

/**
 * @param {string} query  CSS media query string e.g. '(max-width: 599px)'
 * @returns {boolean}
 */
export function useMediaQuery(query) {
  const getMatches = () => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState(getMatches);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    // Modern browsers
    if (mql.addEventListener) {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    }
    // Legacy (Safari <14)
    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  }, [query]);

  return matches;
}
