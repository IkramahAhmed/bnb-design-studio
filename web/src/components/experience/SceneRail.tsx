import type { SectionInfo } from '@/content/site';

interface SceneRailProps {
  sections: readonly SectionInfo[];
  active: number;
  onSelect: (id: string) => void;
}

/** Dots down the right edge that jump to each section. */
export function SceneRail({ sections, active, onSelect }: SceneRailProps) {
  return (
    <ul className="rail" aria-label="Page sections">
      {sections.map((section, i) => (
        <li key={section.id}>
          <button
            type="button"
            className={i === active ? 'on' : undefined}
            aria-label={section.name}
            aria-current={i === active ? 'true' : undefined}
            title={section.name}
            onClick={() => onSelect(section.id)}
          />
        </li>
      ))}
    </ul>
  );
}

/** "03 / 09 STRUCTURAL" label in the bottom-left corner. */
export function SceneHud({ index, total, name }: { index: number; total: number; name: string }) {
  return (
    <div className="hud hud-l" aria-hidden="true">
      <span className="hud-num">{String(index + 1).padStart(2, '0')}</span>
      <span className="sl">/ {String(total).padStart(2, '0')}</span>
      <span className="hud-name">{name}</span>
    </div>
  );
}
