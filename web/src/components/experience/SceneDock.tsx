interface SceneDockProps {
  night: boolean;
  onToggleNight: () => void;
  onTurn: (direction: -1 | 1) => void;
  onReset: () => void;
}

/** Floating controls for the 3D building: turn left or right, day or night, reset. */
export function SceneDock({ night, onToggleNight, onTurn, onReset }: SceneDockProps) {
  return (
    <div className="dock" role="group" aria-label="3D building controls">
      <button type="button" onClick={() => onTurn(-1)} aria-label="Turn building left">
        &#8249;
      </button>
      <button type="button" className={night ? 'on' : undefined} onClick={onToggleNight} aria-pressed={night}>
        {night ? 'Day' : 'Night'}
      </button>
      <button type="button" onClick={() => onTurn(1)} aria-label="Turn building right">
        &#8250;
      </button>
      <button type="button" onClick={onReset}>
        Reset
      </button>
    </div>
  );
}
