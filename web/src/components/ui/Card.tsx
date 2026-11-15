import type { ReactNode } from 'react';

interface CardProps {
  wide?: boolean;
  children: ReactNode;
}

/** The frosted glass panel that holds text on top of the 3D scene. */
export function Card({ wide = false, children }: CardProps) {
  return <div className={wide ? 'card wide' : 'card'}>{children}</div>;
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow rv">{children}</p>;
}
