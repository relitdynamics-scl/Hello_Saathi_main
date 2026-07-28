import { useEffect } from 'react';

/*
  Locks background scroll while an overlay is open.

  `overflow: hidden` on <body> alone does not hold on iOS Safari — the page
  still rubber-bands and scroll position is lost on close. Pinning the body
  with position:fixed and restoring the offset afterwards is the reliable fix.

  A counter keeps nested overlays (nav menu over a modal) from unlocking early.
*/

let lockCount = 0;
let savedScrollY = 0;
let savedStyles = null;

function lock() {
  lockCount += 1;
  if (lockCount > 1) return;

  savedScrollY = window.scrollY;
  const { body } = document;
  savedStyles = {
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
    width: body.style.width,
    overflow: body.style.overflow,
  };

  // compensate for the scrollbar disappearing on desktop
  const scrollbar = window.innerWidth - document.documentElement.clientWidth;
  if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

  body.style.position = 'fixed';
  body.style.top = `-${savedScrollY}px`;
  body.style.left = '0';
  body.style.right = '0';
  body.style.width = '100%';
  body.style.overflow = 'hidden';
}

function unlock() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0 || !savedStyles) return;

  const { body } = document;
  body.style.position = savedStyles.position;
  body.style.top = savedStyles.top;
  body.style.left = savedStyles.left;
  body.style.right = savedStyles.right;
  body.style.width = savedStyles.width;
  body.style.overflow = savedStyles.overflow;
  body.style.paddingRight = '';
  savedStyles = null;

  // restore without the smooth-scroll easing kicking in
  const html = document.documentElement;
  const prevBehavior = html.style.scrollBehavior;
  html.style.scrollBehavior = 'auto';
  window.scrollTo(0, savedScrollY);
  html.style.scrollBehavior = prevBehavior;
}

export function useScrollLock(active) {
  useEffect(() => {
    if (!active) return;
    lock();
    return unlock;
  }, [active]);
}

/* Closes an overlay on Escape. */
export function useEscapeKey(active, onEscape) {
  useEffect(() => {
    if (!active) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onEscape();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, onEscape]);
}
