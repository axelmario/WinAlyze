// src/components/features/compare/components/StatBar.jsx
export function StatBar({ homeValue, awayValue, isNegative = false }) {
    const safeHomeValue = homeValue || 0;
    const safeAwayValue = awayValue || 0;
    
    const isHomeWinning = isNegative 
      ? safeHomeValue < safeAwayValue 
      : safeHomeValue > safeAwayValue;
  
    const total = safeHomeValue + safeAwayValue;
    const homePercent = total === 0 ? 50 : (safeHomeValue / total) * 100;
    const awayPercent = total === 0 ? 50 : (safeAwayValue / total) * 100;
  
    return (
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <div className="w-16 text-right font-bold text-gray-900">{safeHomeValue.toFixed(2)}</div>
          <div className="flex-1 flex h-3 rounded-full overflow-hidden">
            <div 
              className={`h-full ${isHomeWinning ? 'bg-green-500' : 'bg-red-500'} transition-all duration-300`}
              style={{ width: `${homePercent}%` }}
            />
            <div 
              className={`h-full ${!isHomeWinning ? 'bg-green-500' : 'bg-red-500'} transition-all duration-300`}
              style={{ width: `${awayPercent}%` }}
            />
          </div>
          <div className="w-16 text-left font-bold text-gray-900">{safeAwayValue.toFixed(2)}</div>
        </div>
      </div>
    );
  }