'use client';

import { useEffect } from 'react';

/** Fades each section in the first time it scrolls into view. Renders nothing itself. */
export function RevealObserver() {
  useEffect(() => {
    const panels = document.querySelectorAll<HTMLElement>('.panel:not(.in)');
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('in');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.18 },
    );
    panels.forEach((panel) => observer.observe(panel));
    return () => observer.disconnect();
  }, []);

  return null;
}
