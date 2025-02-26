// src/components/features/compare/components/StatsGrid.jsx
import { StatBar } from './StatBar';

export function StatsGrid({ stats, homeLogo, awayLogo, expectedValues, title }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <img src={homeLogo} alt="" className="w-8 h-8" />
        <div className="text-lg font-semibold text-gray-900">{title}</div>
        <img src={awayLogo} alt="" className="w-8 h-8" />
      </div>
      
      <div className="space-y-6">
        {stats.map((stat, index) => (
          <div key={index} className="space-y-2">
            <div className="text-sm font-medium text-gray-700">{stat.label}</div>
            <StatBar
              homeValue={stat.home}
              awayValue={stat.away}
              isNegative={stat.isNegative}
            />
          </div>
        ))}

        {/* Expected Values Section */}
        {expectedValues && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm font-medium text-gray-500 mb-3">Valori Attesi</div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Casa</div>
                <div className="font-semibold text-gray-900">{expectedValues.home.toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Totale</div>
                <div className="font-semibold text-gray-900">{expectedValues.total.toFixed(2)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Trasferta</div>
                <div className="font-semibold text-gray-900">{expectedValues.away.toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}