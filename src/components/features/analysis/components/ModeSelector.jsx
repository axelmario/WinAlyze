// src/components/features/analysis/components/ModeSelector.jsx
export function ModeSelector({ mode, onChange }) {
  const modes = [
    { id: 'UO_SQUAD', label: 'U/O Squadra' },
    { id: 'UO_MATCH', label: 'U/O Partita' },
    { id: 'ONE_X_TWO', label: '1X2' }
  ];

  return (
    <div className="flex justify-center space-x-4 mb-6">
      {modes.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`px-4 py-2 rounded-md transition-colors ${
            mode === id
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}