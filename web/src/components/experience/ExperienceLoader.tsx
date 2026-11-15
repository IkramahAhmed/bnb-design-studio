'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// The 3D code (Three.js) is a separate download that never blocks the page text.
const Experience = dynamic(() => import('./Experience'), { ssr: false });

interface ConnectionInfo {
  saveData?: boolean;
}

/** Starts the 3D scene once the browser is idle, and skips it for visitors who asked to save data. */
export function ExperienceLoader() {
  const [load, setLoad] = useState(false);

  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: ConnectionInfo }).connection;
    if (connection?.saveData) return;

    // Safari has no requestIdleCallback, so check for the function itself.
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(() => setLoad(true), { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }
    const timer = window.setTimeout(() => setLoad(true), 400);
    return () => window.clearTimeout(timer);
  }, []);

  return load ? <Experience /> : null;
}
