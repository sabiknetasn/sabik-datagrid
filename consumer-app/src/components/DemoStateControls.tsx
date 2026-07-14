export type DemoMode = 'data' | 'loading' | 'empty' | 'error';

interface DemoStateControlsProps {
  mode: DemoMode;
  onChange: (mode: DemoMode) => void;
}

const modes: { id: DemoMode; label: string }[] = [
  { id: 'data', label: 'Data' },
  { id: 'loading', label: 'Loading' },
  { id: 'empty', label: 'Empty' },
  { id: 'error', label: 'Error' },
];

export function DemoStateControls({ mode, onChange }: DemoStateControlsProps) {
  return (
    <div className="demo-controls" role="group" aria-label="Demo states">
      {modes.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`demo-controls__btn ${mode === item.id ? 'is-active' : ''}`}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
