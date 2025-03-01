// src/components/features/analysis/components/TeamMatches.jsx
import { calculateLineStats, getStatValue, calculateMatchTotal } from '../utils/analysis';

function formatValue(value) {
  if (value === undefined || value === null) return '-';
  return Math.round(value).toString();
}

export function TeamMatches({ 
  teamId, 
  teamData, 
  isPerforming,
  mode,
  selectedCategory,
  lineValue,
  isHomeTeamInCurrentMatch
}) {
  // Verifica di sicurezza sui dati in ingresso
  if (!teamData || !teamData.fixturesStats || !Array.isArray(teamData.fixturesStats)) {
    console.log("TeamMatches: Dati mancanti", { teamId, hasTeamData: !!teamData });
    return (
      <div className="flex-1 max-w-md">
        <div className="p-4 bg-red-100 text-red-800 rounded">
          Nessun dato disponibile per questa squadra
        </div>
      </div>
    );
  }

  // Prendi tutte le partite valide e rimuovi eventuali elementi nulli
  let matches = [...teamData.fixturesStats].filter(match => match !== null && match !== undefined);
  
  // Filtra solo le partite terminate
  matches = matches.filter(match => {
    const status = match.status;
    return status === 'FT' || status === 'AET' || status === 'PEN' || 
           status === 'FINISHED' || status?.toUpperCase()?.includes('FT');
  });
  
  // Filtra per casa/trasferta in base al parametro
  if (isHomeTeamInCurrentMatch) {
    // Solo partite in casa
    matches = matches.filter(m => {
      const homeId = m.home_team_id;
      return homeId === parseInt(teamId, 10) || homeId === teamId || homeId?.toString() === teamId?.toString();
    });
  } else {
    // Solo partite in trasferta
    matches = matches.filter(m => {
      const awayId = m.away_team_id;
      return awayId === parseInt(teamId, 10) || awayId === teamId || awayId?.toString() === teamId?.toString();
    });
  }

  // Ordina le partite per data (più recenti prima)
  matches = matches.sort((a, b) => {
    if (!a?.date || !b?.date) return 0;
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA;
  });

  // Formatta la data in formato italiano
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      return '-';
    }
  };

  // Calcola le statistiche per qualsiasi modalità, incluso 1X2
  let stats = null;
  try {
    if (selectedCategory && matches.length > 0) {
      if (mode === 'ONE_X_TWO') {
        // Per 1X2 calcoliamo noi la percentuale di successo
        const totalMatches = matches.length;
        let winsCount = 0;
        
        matches.forEach(matchData => {
          if (!matchData.match_statistics) return;
          
          const isHomeTeam = matchData.home_team_id.toString() === teamId.toString();
          const homeValue = getStatValue(matchData, selectedCategory, matchData.home_team_id, true);
          const awayValue = getStatValue(matchData, selectedCategory, matchData.away_team_id, true);
          
          if (homeValue === null || awayValue === null) return;
          
          // Conta come vittoria se la squadra ha un valore superiore
          if (isHomeTeam && homeValue > awayValue) {
            winsCount++;
          } else if (!isHomeTeam && awayValue > homeValue) {
            winsCount++;
          }
        });
        
        stats = {
          total: totalMatches,
          over: winsCount,
          percentage: totalMatches > 0 ? ((winsCount / totalMatches) * 100).toFixed(1) : '0.0'
        };
      } else {
        // Per le altre modalità, usa la funzione esistente
        stats = calculateLineStats(matches, teamId, selectedCategory, lineValue, isPerforming, mode);
      }
    }
  } catch (error) {
    console.error('Error calculating stats:', error);
  }

  return (
    <div className="flex-1 max-w-md">
      <div className="text-center mb-6">
        <img 
          src={teamData.team?.logo || '/placeholder-team-logo.png'} 
          alt={teamData.team?.name || 'Team logo'} 
          className={`w-16 h-16 mx-auto mb-2 ${!isPerforming && mode === 'UO_SQUAD' ? 'grayscale' : ''}`}
        />
        <h3 className="text-lg font-bold text-gray-900">{teamData.team?.name || 'Team'}</h3>
        {stats && (
          <div className="text-sm text-gray-600 mt-1">
            {mode === 'ONE_X_TWO' 
              ? `Vittorie ${stats.over}/${stats.total} (${stats.percentage}%)`
              : `Linea superata ${stats.over}/${stats.total} (${stats.percentage}%)`
            }
          </div>
        )}
        {/* Rimosso il conteggio delle partite trovate */}
      </div>

      {matches.length === 0 ? (
        <div className="p-4 bg-yellow-100 text-yellow-800 rounded">
          Nessuna partita trovata per i criteri selezionati
        </div>
      ) : (
        <div className="space-y-2">
          {matches.map((matchData, index) => {
            if (!matchData) return null;
            
            let resultClass = 'bg-gray-100';
            let value = '';

            try {
              if (mode === 'ONE_X_TWO') {
                // Modalità 1X2: confronta le statistiche tra le due squadre
                const isHomeTeam = matchData.home_team_id.toString() === teamId.toString();
                
                const homeTeamValue = getStatValue(matchData, selectedCategory, matchData.home_team_id, true);
                const awayTeamValue = getStatValue(matchData, selectedCategory, matchData.away_team_id, true);
                
                if (homeTeamValue === null || awayTeamValue === null) {
                  resultClass = 'bg-gray-100';
                  value = 'N/D';
                } else if (homeTeamValue === awayTeamValue) {
                  resultClass = 'bg-yellow-100';
                  value = `${formatValue(homeTeamValue)}-${formatValue(awayTeamValue)}`;
                } else if (isHomeTeam) {
                  resultClass = homeTeamValue > awayTeamValue ? 'bg-green-100' : 'bg-red-100';
                  value = `${formatValue(homeTeamValue)}-${formatValue(awayTeamValue)}`;
                } else {
                  resultClass = awayTeamValue > homeTeamValue ? 'bg-green-100' : 'bg-red-100';
                  value = `${formatValue(homeTeamValue)}-${formatValue(awayTeamValue)}`;
                }
              } else if (mode === 'UO_MATCH') {
                // Modalità Under/Over Partita: considera il totale delle due squadre
                const totals = calculateMatchTotal(matchData, selectedCategory);
                
                if (!totals || totals.total === null) {
                  resultClass = 'bg-gray-100';
                  value = 'N/D';
                } else {
                  const isOver = lineValue && totals.total > parseFloat(lineValue);
                  resultClass = isOver ? 'bg-green-100' : 'bg-red-100';
                  value = `${formatValue(totals.total)} (${formatValue(totals.homeValue)}+${formatValue(totals.awayValue)})`;
                }
              } else {
                // Modalità Under/Over Squadra: considera solo la squadra selezionata
                const statValue = getStatValue(matchData, selectedCategory, teamId, isPerforming);
                
                if (statValue === null) {
                  resultClass = 'bg-gray-100';
                  value = 'N/D';
                } else {
                  const isOver = lineValue && parseFloat(statValue) > parseFloat(lineValue);
                  resultClass = isOver ? 'bg-green-100' : 'bg-red-100';
                  value = formatValue(statValue);
                }
              }
            } catch (error) {
              console.error('Error calculating match values:', error);
              resultClass = 'bg-gray-100';
              value = 'Errore';
            }

            // Determina l'avversario e ottieni logo e nome
            let opponentName = "";
            let opponentLogo = "";
            
            try {
              if (matchData.home_team_id.toString() === teamId.toString()) {
                // La squadra è in casa, quindi l'avversario è la squadra in trasferta
                opponentName = matchData.away_team_name || 'Avversario';
                opponentLogo = matchData.away_team_logo || '';
              } else {
                // La squadra è in trasferta, quindi l'avversario è la squadra di casa
                opponentName = matchData.home_team_name || 'Avversario';
                opponentLogo = matchData.home_team_logo || '';
              }
            } catch (error) {
              opponentName = 'Avversario';
              opponentLogo = '';
            }

            return (
              <div 
                key={`${matchData.id || index}-${index}-${teamId}`}
                className={`p-3 rounded-lg ${resultClass} transition-colors`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-900">
                      {formatDate(matchData.date)}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      vs 
                      {opponentLogo && (
                        <img 
                          src={opponentLogo} 
                          alt={opponentName} 
                          className="w-4 h-4 inline-block mr-1"
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                      )}
                      {opponentName}
                    </div>
                  </div>
                  
                  <div className="text-right font-bold text-gray-900">
                    {value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}