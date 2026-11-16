'use client';

import { useEffect } from 'react';

/** Stores the target section id in sessionStorage so Experience.tsx scrolls there after the 3D scene is ready. */
export function SectionScrollTo({ section }: { section: string }) {
  useEffect(() => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('scrollToSection', section);
    }
  }, [section]);
  return null;
}
