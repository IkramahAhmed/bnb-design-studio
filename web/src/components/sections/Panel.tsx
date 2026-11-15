import type { ReactNode } from 'react';

interface PanelProps {
  id: string;
  /** Short label shown in the scene indicator. Must be unique per panel. */
  name: string;
  align?: 'left' | 'right' | 'center';
  /** Visible from the first paint (use for the hero), instead of fading in on scroll. */
  eager?: boolean;
  children: ReactNode;
}

/**
 * One full-height section. The 3D camera moves to a new viewpoint as each panel scrolls into
 * view, so panel order must match `SCENES` in lib/three/scenes.ts.
 */
export function Panel({ id, name, align = 'left', eager = false, children }: PanelProps) {
  return (
    <section id={id} className={`panel ${align}${eager ? ' in' : ''}`} data-scene data-name={name} aria-label={name}>
      {children}
    </section>
  );
}
