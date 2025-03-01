// src/components/features/analysis/utils/analysis.js

/**
 * Costanti per le categorie di analisi
 */
export const CATEGORIES = {
  UO_SQUAD: [
    { id: 'tiri', label: 'Tiri', hasLine: true },
    { id: 'tiriPorta', label: 'Tiri in Porta', hasLine: true },
    { id: 'falli', label: 'Falli', hasLine: true },
    { id: 'corner', label: 'Corner', hasLine: true },
    { id: 'cornerPT', label: 'Corner 1° Tempo', hasLine: true },
    { id: 'fuorigioco', label: 'Fuorigioco', hasLine: true },
    { id: 'cartellini', label: 'Cartellini', hasLine: true },
    { id: 'parate', label: 'Parate', hasLine: true }
  ],
  UO_MATCH: [
    { id: 'tiri', label: 'Tiri', hasLine: true },
    { id: 'tiriPorta', label: 'Tiri in Porta', hasLine: true },
    { id: 'falli', label: 'Falli', hasLine: true },
    { id: 'corner', label: 'Corner', hasLine: true },
    { id: 'cornerPT', label: 'Corner 1° Tempo', hasLine: true },
    { id: 'fuorigioco', label: 'Fuorigioco', hasLine: true },
    { id: 'cartellini', label: 'Cartellini', hasLine: true }
  ],
  ONE_X_TWO: [
    { id: 'tiri', label: 'Tiri', hasLine: false },
    { id: 'tiriPorta', label: 'Tiri in Porta', hasLine: false },
    { id: 'falli', label: 'Falli', hasLine: false },
    { id: 'corner', label: 'Corner', hasLine: false },
    { id: 'cornerPT', label: 'Corner 1° Tempo', hasLine: false },
    { id: 'fuorigioco', label: 'Fuorigioco', hasLine: false },
    { id: 'cartellini', label: 'Cartellini', hasLine: false },
    { id: 'parate', label: 'Parate', hasLine: false }
  ]
};

/**
 * Ottiene il valore di una statistica da un match
 * @param {Object} match - Oggetto match con statistiche
 * @param {string} statType - Tipo di statistica
 * @param {number} teamId - ID della squadra
 * @param {boolean} isPerforming - true per statistiche effettuate, false per subite
 * @returns {number|null} - Valore della statistica
 */
export function getStatValue(match, statType, teamId, isPerforming) {
  if (!match?.match_statistics) return null;
  
  const stats = match.match_statistics;
  const isHomeTeam = match.home_team_id === parseInt(teamId);
  
  // Determina quale squadra stiamo analizzando
  const teamToCheck = isPerforming ? 
    (isHomeTeam ? 'home' : 'away') : 
    (isHomeTeam ? 'away' : 'home');
  
  // Ottiene il valore in base al tipo di statistica
  switch (statType) {
    case 'tiri':
      return teamToCheck === 'home' ? stats.shots_home : stats.shots_away;
      
    case 'tiriPorta':
      return teamToCheck === 'home' ? stats.shots_on_target_home : stats.shots_on_target_away;
      
    case 'falli':
      return teamToCheck === 'home' ? stats.fouls_home : stats.fouls_away;
      
    case 'corner':
      return teamToCheck === 'home' ? stats.corners_home : stats.corners_away;
      
    case 'cornerPT':
      return teamToCheck === 'home' ? stats.corners_ht_home : stats.corners_ht_away;
      
    case 'fuorigioco':
      return teamToCheck === 'home' ? stats.offsides_home : stats.offsides_away;
      
    case 'cartellini':
      const yellowCards = teamToCheck === 'home' ? 
        (stats.yellow_cards_home || 0) : 
        (stats.yellow_cards_away || 0);
      
      const redCards = teamToCheck === 'home' ? 
        (stats.red_cards_home || 0) : 
        (stats.red_cards_away || 0);
      
      return yellowCards + redCards;
      
    case 'parate':
      return teamToCheck === 'home' ? stats.saves_home : stats.saves_away;
      
    default:
      return null;
  }
}

/**
 * Calcola il totale di una statistica per una partita
 * @param {Object} match - Oggetto match con statistiche
 * @param {string} selectedCategory - Categoria statistica selezionata
 * @returns {Object} - Totale e valori per squadra casa e trasferta
 */
export function calculateMatchTotal(match, selectedCategory) {
  if (!match?.match_statistics) return { total: 0, homeValue: 0, awayValue: 0 };
  
  const stats = match.match_statistics;
  let homeValue = 0;
  let awayValue = 0;
  
  switch (selectedCategory) {
    case 'tiri':
      homeValue = stats.shots_home || 0;
      awayValue = stats.shots_away || 0;
      break;
      
    case 'tiriPorta':
      homeValue = stats.shots_on_target_home || 0;
      awayValue = stats.shots_on_target_away || 0;
      break;
      
    case 'falli':
      homeValue = stats.fouls_home || 0;
      awayValue = stats.fouls_away || 0;
      break;
      
    case 'corner':
      homeValue = stats.corners_home || 0;
      awayValue = stats.corners_away || 0;
      break;
      
    case 'cornerPT':
      homeValue = stats.corners_ht_home || 0;
      awayValue = stats.corners_ht_away || 0;
      break;
      
    case 'fuorigioco':
      homeValue = stats.offsides_home || 0;
      awayValue = stats.offsides_away || 0;
      break;
      
    case 'cartellini':
      homeValue = (stats.yellow_cards_home || 0) + (stats.red_cards_home || 0);
      awayValue = (stats.yellow_cards_away || 0) + (stats.red_cards_away || 0);
      break;
      
    case 'parate':
      homeValue = stats.saves_home || 0;
      awayValue = stats.saves_away || 0;
      break;
      
    default:
      break;
  }
  
  return {
    total: homeValue + awayValue,
    homeValue,
    awayValue
  };
}

/**
 * Calcola le statistiche relative a una linea per un insieme di partite
 * @param {Array} matches - Partite da analizzare
 * @param {number} teamId - ID della squadra
 * @param {string} selectedCategory - Categoria statistica selezionata
 * @param {string} lineValue - Valore della linea
 * @param {boolean} isPerforming - true per statistiche effettuate, false per subite
 * @param {string} mode - Modalità di analisi
 * @returns {Object|null} - Statistiche calcolate
 */
export function calculateLineStats(matches, teamId, selectedCategory, lineValue, isPerforming, mode) {
  if (!matches?.length || (!lineValue && mode !== 'ONE_X_TWO')) return null;
  
  const results = {
    total: 0,     // Numero totale di partite analizzate
    over: 0,      // Numero di partite sopra la linea
    percentage: '0.0'  // Percentuale di partite sopra la linea
  };

  matches.forEach(match => {
    if (mode === 'ONE_X_TWO') {
      // Modalità 1X2: considera chi ha fatto più della statistica
      const teamValue = getStatValue(match, selectedCategory, teamId, true);
      const opponentId = match.home_team_id === parseInt(teamId) 
        ? match.away_team_id 
        : match.home_team_id;
      const opponentValue = getStatValue(match, selectedCategory, opponentId, true);

      if (teamValue !== null && opponentValue !== null) {
        results.total++;
        if (teamValue > opponentValue) results.over++;
      }
    } else if (mode === 'UO_MATCH') {
      // Modalità Under/Over Partita: considera il totale delle due squadre
      const { total } = calculateMatchTotal(match, selectedCategory);
      if (total !== null) {
        results.total++;
        if (total > parseFloat(lineValue)) results.over++;
      }
    } else {
      // Modalità Under/Over Squadra: considera solo la squadra selezionata
      const value = getStatValue(match, selectedCategory, teamId, isPerforming);
      if (value !== null) {
        results.total++;
        if (value > parseFloat(lineValue)) results.over++;
      }
    }
  });

  if (results.total > 0) {
    results.percentage = ((results.over / results.total) * 100).toFixed(1);
  }

  return results;
}