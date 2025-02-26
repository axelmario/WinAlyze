// src/components/features/compare/hooks/useTeamAnalysis.js
import { useState, useEffect } from 'react';
import { supabaseService } from '@/services/supabase-service';

export function useTeamAnalysis(match) {
  const [homeTeam, setHomeTeam] = useState(null);
  const [awayTeam, setAwayTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!match) return;
    
    const loadTeamsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const homeTeamId = match.teams.home.id;
        const awayTeamId = match.teams.away.id;
        const leagueId = match.league.id;
        const season = match.league.season || 2024;
        
        // Recupera le partite di entrambe le squadre
        const [homeTeamFixtures, awayTeamFixtures] = await Promise.all([
          supabaseService.getTeamFixtures(homeTeamId, season),
          supabaseService.getTeamFixtures(awayTeamId, season)
        ]);
        
        console.log(`Recuperate ${homeTeamFixtures.length} partite per squadra casa`);
        console.log(`Recuperate ${awayTeamFixtures.length} partite per squadra trasferta`);
        
        // Calcola le statistiche medie per entrambe le squadre
        const homeStats = calculateTeamStats(homeTeamFixtures, homeTeamId, true);
        const awayStats = calculateTeamStats(awayTeamFixtures, awayTeamId, false);
        
        setHomeTeam({
          id: homeTeamId,
          expected: {
            home: homeStats
          }
        });
        
        setAwayTeam({
          id: awayTeamId,
          expected: {
            away: awayStats
          }
        });
      } catch (err) {
        console.error('Errore nel caricamento analisi squadre:', err);
        setError('Impossibile caricare l\'analisi delle squadre. Riprova più tardi.');
      } finally {
        setLoading(false);
      }
    };
    
    loadTeamsData();
  }, [match]);
  
  return {
    homeTeam,
    awayTeam,
    loading,
    error
  };
}

// Funzione per calcolare le statistiche medie di una squadra
function calculateTeamStats(fixtures, teamId, isHome) {
  if (!fixtures || fixtures.length === 0) return null;
  
  // Filtra solo partite a casa o in trasferta in base a isHome
  const relevantFixtures = fixtures.filter(fixture => 
    isHome ? fixture.home_team_id === teamId : fixture.away_team_id === teamId
  );
  
  if (relevantFixtures.length === 0) return null;
  
  // Prepare le statistiche iniziali
  const stats = {
    shots: { for: 0, against: 0 },
    shotsOnTarget: { for: 0, against: 0 },
    corners: { for: 0, against: 0 },
    firstHalfCorners: { for: 0, against: 0 },
    fouls: { for: 0, against: 0 },
    offsides: { for: 0, against: 0 },
    cards: { yellow: { for: 0, against: 0 }, red: { for: 0, against: 0 } },
    saves: { for: 0, against: 0 }
  };
  
  // Conta quante partite hanno statistiche
  let countWithStats = 0;
  
  // Somma le statistiche di tutte le partite
  for (const fixture of relevantFixtures) {
    // Recupera le statistiche della partita
    const fixtureId = fixture.id;
    let matchStats = null;
    
    // Verifica se la partita ha statistiche nel campo data
    if (fixture.data && fixture.data.statistics) {
      matchStats = fixture.data.statistics;
    } else {
      // Altrimenti controlla nel campo separato
      matchStats = fixture.match_statistics;
    }
    
    if (!matchStats) continue;
    countWithStats++;
    
    // Funzione per ottenere una statistica specifica
    const getStat = (teamId, statType) => {
      if (isHome) {
        // Se è la squadra di casa
        if (statType === 'yellows') return matchStats.yellow_cards_home || 0;
        if (statType === 'reds') return matchStats.red_cards_home || 0;
        if (statType === 'yellowsAgainst') return matchStats.yellow_cards_away || 0;
        if (statType === 'redsAgainst') return matchStats.red_cards_away || 0;
        if (statType === 'shots') return matchStats.shots_home || 0;
        if (statType === 'shotsAgainst') return matchStats.shots_away || 0;
        if (statType === 'shotsOnTarget') return matchStats.shots_on_target_home || 0;
        if (statType === 'shotsOnTargetAgainst') return matchStats.shots_on_target_away || 0;
        if (statType === 'corners') return matchStats.corners_home || 0;
        if (statType === 'cornersAgainst') return matchStats.corners_away || 0;
        if (statType === 'firstHalfCorners') return matchStats.corners_ht_home || 0;
        if (statType === 'firstHalfCornersAgainst') return matchStats.corners_ht_away || 0;
        if (statType === 'fouls') return matchStats.fouls_home || 0;
        if (statType === 'foulsAgainst') return matchStats.fouls_away || 0;
        if (statType === 'offsides') return matchStats.offsides_home || 0;
        if (statType === 'offsidesAgainst') return matchStats.offsides_away || 0;
      } else {
        // Se è la squadra in trasferta
        if (statType === 'yellows') return matchStats.yellow_cards_away || 0;
        if (statType === 'reds') return matchStats.red_cards_away || 0;
        if (statType === 'yellowsAgainst') return matchStats.yellow_cards_home || 0;
        if (statType === 'redsAgainst') return matchStats.red_cards_home || 0;
        if (statType === 'shots') return matchStats.shots_away || 0;
        if (statType === 'shotsAgainst') return matchStats.shots_home || 0;
        if (statType === 'shotsOnTarget') return matchStats.shots_on_target_away || 0;
        if (statType === 'shotsOnTargetAgainst') return matchStats.shots_on_target_home || 0;
        if (statType === 'corners') return matchStats.corners_away || 0;
        if (statType === 'cornersAgainst') return matchStats.corners_home || 0;
        if (statType === 'firstHalfCorners') return matchStats.corners_ht_away || 0;
        if (statType === 'firstHalfCornersAgainst') return matchStats.corners_ht_home || 0;
        if (statType === 'fouls') return matchStats.fouls_away || 0;
        if (statType === 'foulsAgainst') return matchStats.fouls_home || 0;
        if (statType === 'offsides') return matchStats.offsides_away || 0;
        if (statType === 'offsidesAgainst') return matchStats.offsides_home || 0;
      }
      return 0;
    };
    
    // Accumula le statistiche
    stats.shots.for += getStat(teamId, 'shots');
    stats.shots.against += getStat(teamId, 'shotsAgainst');
    stats.shotsOnTarget.for += getStat(teamId, 'shotsOnTarget');
    stats.shotsOnTarget.against += getStat(teamId, 'shotsOnTargetAgainst');
    stats.corners.for += getStat(teamId, 'corners');
    stats.corners.against += getStat(teamId, 'cornersAgainst');
    stats.firstHalfCorners.for += getStat(teamId, 'firstHalfCorners');
    stats.firstHalfCorners.against += getStat(teamId, 'firstHalfCornersAgainst');
    stats.fouls.for += getStat(teamId, 'fouls');
    stats.fouls.against += getStat(teamId, 'foulsAgainst');
    stats.offsides.for += getStat(teamId, 'offsides');
    stats.offsides.against += getStat(teamId, 'offsidesAgainst');
    stats.cards.yellow.for += getStat(teamId, 'yellows');
    stats.cards.yellow.against += getStat(teamId, 'yellowsAgainst');
    stats.cards.red.for += getStat(teamId, 'reds');
    stats.cards.red.against += getStat(teamId, 'redsAgainst');
  }
  
  // Se non ci sono partite con statistiche, ritorna null
  if (countWithStats === 0) return null;
  
  // Calcola la media dividendo per il numero di partite
  Object.keys(stats).forEach(key => {
    if (stats[key].for !== undefined) {
      stats[key].for = parseFloat((stats[key].for / countWithStats).toFixed(2));
      stats[key].against = parseFloat((stats[key].against / countWithStats).toFixed(2));
    } else if (key === 'cards') {
      stats[key].yellow.for = parseFloat((stats[key].yellow.for / countWithStats).toFixed(2));
      stats[key].yellow.against = parseFloat((stats[key].yellow.against / countWithStats).toFixed(2));
      stats[key].red.for = parseFloat((stats[key].red.for / countWithStats).toFixed(2));
      stats[key].red.against = parseFloat((stats[key].red.against / countWithStats).toFixed(2));
    }
  });
  
  return stats;
}