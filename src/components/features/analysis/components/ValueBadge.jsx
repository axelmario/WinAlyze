// src/components/features/analysis/components/ValueBadge.jsx
import React from 'react';

function ValueBadge({ percentage1, percentage2, mode = 'UO_SQUAD', expectedValue1, expectedValue2 }) {
  // Verifica che i valori percentuali siano numeri validi
  const safePercentage1 = isNaN(percentage1) ? 0 : percentage1;
  const safePercentage2 = isNaN(percentage2) ? 0 : percentage2;
  const avgPercentage = (safePercentage1 + safePercentage2) / 2;

  // Funzione per determinare lo stake per U/O
  const getUOStake = (avgPerc) => {
    if (avgPerc >= 90) return 2;
    if (avgPerc >= 85) return 1.5;
    if (avgPerc >= 75) return 1.25;
    if (avgPerc >= 70) return 1;
    if (avgPerc >= 65) return 0.75;
    return null;
  };

  // Funzione per determinare lo stake per 1X2
  const get1X2Stake = (diff) => {
    if (diff > 70) return 2;
    if (diff > 60) return 1.5;
    if (diff > 50) return 1.25;
    if (diff > 40) return 1;
    if (diff > 30) return 0.75;
    return null;
  };

  // Funzione per determinare lo stake per contropronostico
  const getContraStake = (expDiff) => {
    if (expDiff < 10) return 0.5;
    if (expDiff < 15) return 0.35;
    if (expDiff < 20) return 0.2;
    return null;
  };

  return (
    <div className="space-y-2">
      {/* U/O Value Badges */}
      {['UO_SQUAD', 'UO_PARTITA', 'UO_MATCH'].includes(mode) && (
        <>
          {avgPercentage >= 75 && (
            <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium">
              <span className="mr-1">⭐⭐⭐</span>
              <span>Ottimo Valore Over</span>
              <span className="ml-1 text-xs opacity-75">
                (Stake: {getUOStake(avgPercentage)}%)
              </span>
            </div>
          )}
          
          {avgPercentage <= 25 && (
            <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium">
              <span className="mr-1">⭐⭐⭐</span>
              <span>Ottimo Valore Under</span>
              <span className="ml-1 text-xs opacity-75">
                (Stake: {getUOStake(100 - avgPercentage)}%)
              </span>
            </div>
          )}
          
          {avgPercentage > 65 && avgPercentage < 75 && (
            <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-green-500 text-white text-sm font-medium">
              <span className="mr-1">⭐⭐</span>
              <span>Buon Valore Over</span>
              <span className="ml-1 text-xs opacity-75">
                (Stake: {getUOStake(avgPercentage)}%)
              </span>
            </div>
          )}
          
          {avgPercentage > 25 && avgPercentage <= 35 && (
            <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-green-500 text-white text-sm font-medium">
              <span className="mr-1">⭐⭐</span>
              <span>Buon Valore Under</span>
              <span className="ml-1 text-xs opacity-75">
                (Stake: {getUOStake(100 - avgPercentage)}%)
              </span>
            </div>
          )}
        </>
      )}

      {/* 1X2 Value Badges */}
      {mode === 'ONE_X_TWO' && (
        <>
          {/* Ottimo Valore 1X2 */}
          {((safePercentage1 >= 75 && safePercentage2 <= 25) || (safePercentage2 >= 75 && safePercentage1 <= 25)) && (
            <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium">
              <span className="mr-1">⭐⭐⭐</span>
              <span>Ottimo Valore {safePercentage1 > safePercentage2 ? '1' : '2'}</span>
              <span className="ml-1 text-xs opacity-75">
                (Stake: {get1X2Stake(Math.abs(safePercentage1 - safePercentage2))}%)
              </span>
            </div>
          )}

          {/* Buon Valore 1X2 */}
          {((safePercentage1 >= 65 && safePercentage1 < 75 && safePercentage2 >= 25 && safePercentage2 <= 35) ||
            (safePercentage2 >= 65 && safePercentage2 < 75 && safePercentage1 >= 25 && safePercentage1 <= 35)) && (
            <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-green-500 text-white text-sm font-medium">
              <span className="mr-1">⭐⭐</span>
              <span>Buon Valore {safePercentage1 > safePercentage2 ? '1' : '2'}</span>
              <span className="ml-1 text-xs opacity-75">
                (Stake: {get1X2Stake(Math.abs(safePercentage1 - safePercentage2))}%)
              </span>
            </div>
          )}

          {/* Contropronostico */}
          {expectedValue1 && expectedValue2 && (
            (() => {
              try {
                const expectedDiffPercentage = ((Math.max(expectedValue1, expectedValue2) - 
                  Math.min(expectedValue1, expectedValue2)) / Math.max(expectedValue1, expectedValue2)) * 100;
                
                const percentageDiff = Math.abs(safePercentage1 - safePercentage2);
                const isRegularValue = (safePercentage1 >= 65 && safePercentage2 <= 35) || 
                                    (safePercentage2 >= 65 && safePercentage1 <= 35);
                
                if (!isRegularValue && expectedDiffPercentage < 20 && percentageDiff > 30) {
                  return (
                    <div className="inline-flex items-center px-3 py-1.5 rounded-lg bg-purple-100 text-purple-800 text-sm font-medium border border-purple-200">
                      <span className="mr-1 text-yellow-500">⚡</span>
                      <span>Contropronostico {safePercentage1 < safePercentage2 ? '1' : '2'}</span>
                      <span className="ml-1 text-xs opacity-75">
                        (Stake: {getContraStake(expectedDiffPercentage)}%)
                      </span>
                    </div>
                  );
                }
                return null;
              } catch (error) {
                console.error('Error in contropronostico calculation:', error);
                return null;
              }
            })()
          )}
        </>
      )}
    </div>
  );
}

export default ValueBadge;