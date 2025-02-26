// src/components/features/matches/components/MatchdaySelector.jsx
export function MatchdaySelector({ currentMatchday, onMatchdayChange, disabled }) {
    // Genera un array di giornate (per semplicità, assumi 38 giornate)
    const matchdays = Array.from({ length: 38 }, (_, i) => i + 1);
    
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Seleziona Giornata</h2>
          
          <div className="flex space-x-2">
            <button
              onClick={() => onMatchdayChange(Math.max(1, currentMatchday - 1))}
              disabled={disabled || currentMatchday === 1}
              className="p-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              &larr;
            </button>
            
            <select
              value={currentMatchday}
              onChange={(e) => onMatchdayChange(parseInt(e.target.value))}
              disabled={disabled}
              className="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {matchdays.map(day => (
                <option key={day} value={day}>
                  Giornata {day}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => onMatchdayChange(Math.min(38, currentMatchday + 1))}
              disabled={disabled || currentMatchday === 38}
              className="p-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }