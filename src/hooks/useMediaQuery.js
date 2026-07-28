import { useEffect, useState } from 'react';

/*
  Reactive media query. Used to drop the heavier desktop animations on
  phones, where framer-motion's layout projection is the main source of jank.
*/
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (!window.matchMedia) return;
    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/* Phones and small tablets — matches the CSS breakpoint used for the grid. */
export function useIsMobile() {
  return useMediaQuery('(max-width: 780px)');
}

/* True on touch-primary devices, where hover and mousemove are unreliable. */
export function useIsTouch() {
  return useMediaQuery('(hover: none), (pointer: coarse)');
}

export function usePrefersReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
