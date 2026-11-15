'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { NAV_LINKS, SITE } from '@/content/site';

export function Header() {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  return (
    <>
      <header className="nav">
        <a className="brand" href="#home" aria-label={`${SITE.name} home`} onClick={close}>
          <Image src="/logo.jpg" alt={`${SITE.name} logo`} width={56} height={56} priority />
        </a>

        {/* Desktop nav links */}
        <nav className="links" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <Button href="#contact" variant="small" className="nav-cta">
          Start a project
        </Button>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="ham"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {/* Mobile nav drawer */}
      {open && (
        <div id="mobile-nav" className="mob-nav" role="dialog" aria-label="Navigation menu">
          <nav>
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} onClick={close}>
                {link.label}
              </a>
            ))}
            <a href="#contact" className="btn btn-sm mob-cta" onClick={close}>
              Start a project
            </a>
          </nav>
        </div>
      )}
    </>
  );
}
