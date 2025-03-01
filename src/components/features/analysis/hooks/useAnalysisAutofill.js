// src/components/features/analysis/hooks/useAnalysisAutofill.js
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabase-client';

/**
 * Hook per suggerire automaticamente le linee di scommessa
 * @param {string} mode - Modalità di analisi (UO_SQUAD, UO_MATCH, ONE_X_TWO)
 * @param {Object} match - La partita selezionata
 * @returns {Object} - Funzioni per suggerire le linee
 */
export function useAnalysisAutofill(mode, match) {
  const [avgStats, setAvgStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [debug, setDebug] = useState({});

  // Caricamento delle statistiche medie
  useEffect(() => {
    if (!match) return;
    
    const loadTeamStats = async () => {
      try {
        setLoading(true);
        
        // Fetch delle statistiche per entrambe le squadre
        const [homeAvg, awayAvg] = await Promise.all([
          fetchTeamAvgStats(match.league.id, match.league.season, match.teams.home.id, 'home'),
          fetchTeamAvgStats(match.league.id, match.league.season, match.teams.away.id, 'away')
        ]);

        setAvgStats({
          home: { ...homeAvg },
          away: { ...awayAvg }
        });
        
        // Debug info per verificare cosa contiene avgStats
        setDebug({
          homeAvg,
          awayAvg,
          homeId: match.teams.home.id,
          awayId: match.teams.away.id
        });
        
        console.log('AvgStats loaded:', homeAvg, awayAvg);
      } catch (error) {
        console.error('Errore caricamento statistiche medie:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTeamStats();
  }, [match]);
  
  // Funzione per recuperare le statistiche medie dal database
  const fetchTeamAvgStats = async (leagueId, season, teamId, location) => {
    try {
      // Ottieni le statistiche della squadra dal database
      const { data, error } = await supabase
        .from('team_statistics')
        .select('*')
        .eq('team_id', teamId)
        .eq('league_id', leagueId)
        .eq('season', season)
        .single();
      
      if (error) {
        console.error(`Error fetching team statistics:`, error);
        
        // Se non ci sono statistiche nel team_statistics, calcola manualmente dalle partite
        // Questo è un fallback nel caso il database non contenga le statistiche pre-calcolate
        return calculateStatsFromFixtures(leagueId, season, teamId, location);
      }
      
      // Estrai i dati di casa o trasferta dal campo JSON
      const statsField = location === 'home' ? 'home_stats' : 'away_stats';
      let locationStats = {};
      
      try {
        if (data && data[statsField]) {
          locationStats = typeof data[statsField] === 'string' 
            ? JSON.parse(data[statsField]) 
            : data[statsField];
        }
      } catch (e) {
        console.error(`Error parsing ${location} stats:`, e);
      }
      
      console.log(`Statistics for team ${teamId} in ${location}:`, locationStats);
      
      // Mappa delle corrispondenze tra i nomi delle categorie e i campi nel DB
      const categoryMapping = {
        tiri: { for: 'avg_shots', against: 'avg_shots_against' },
        tiriPorta: { for: 'avg_shots_on_target', against: 'avg_shots_on_target_against' },
        corner: { for: 'avg_corners', against: 'avg_corners_against' },
        cornerPT: { for: 'avg_corners_ht', against: 'avg_corners_ht_against' },
        falli: { for: 'avg_fouls', against: 'avg_fouls_against' },
        cartellini: { for: 'avg_yellow_cards', against: 'avg_yellow_cards_against' },
        fuorigioco: { for: 'avg_offsides', against: 'avg_offsides_against' },
        parate: { for: 'avg_saves', against: 'avg_saves_against' }
      };
      
      // Prepara l'oggetto risultato nel formato atteso
      const result = {};
      
      // Per ogni categoria, estrai sia il valore 'for' che 'against'
      Object.entries(categoryMapping).forEach(([category, fields]) => {
        // 'For' significa statistiche fatte dalla squadra
        result[`${category}_for`] = locationStats[fields.for] || data[fields.for] || 0;
        
        // 'Against' significa statistiche subite dalla squadra
        result[`${category}_against`] = locationStats[fields.against] || data[fields.against] || 0;
      });
      
      return result;
    } catch (error) {
      console.error(`Error fetching ${location} team stats:`, error);
      return {};
    }
  };
  
  // Calcola statistiche dalle partite (fallback)
  const calculateStatsFromFixtures = async (leagueId, season, teamId, location) => {
    try {
      const isHome = location === 'home';
      
      // Fetch delle partite per la squadra nella location specificata
      const { data: fixtures, error: fixturesError } = await supabase
        .from('fixtures')
        .select(`
          id,
          home_team_id,
          away_team_id
        `)
        .eq(isHome ? 'home_team_id' : 'away_team_id', teamId)
        .eq('league_id', leagueId)
        .eq('season', season)
        .in('status', ['FT', 'AET', 'PEN']); // Solo partite finite
      
      if (fixturesError) throw fixturesError;
      
      if (!fixtures.length) {
        console.warn(`No fixtures found for team ${teamId} in ${location}`);
        return {};
      }
      
      // Fetch delle statistiche per ogni partita
      const fixtureIds = fixtures.map(fixture => fixture.id);
      const { data: matchStatsList, error: statsError } = await supabase
        .from('match_statistics')
        .select('*')
        .in('fixture_id', fixtureIds);
      
      if (statsError) throw statsError;
      
      // Calcola le medie
      const totalMatches = fixtures.length;
      const stats = {
        tiri_for: 0,
        tiri_against: 0,
        tiriPorta_for: 0,
        tiriPorta_against: 0,
        corner_for: 0,
        corner_against: 0,
        cornerPT_for: 0,
        cornerPT_against: 0,
        falli_for: 0,
        falli_against: 0,
        cartellini_for: 0,
        cartellini_against: 0,
        fuorigioco_for: 0,
        fuorigioco_against: 0,
        parate_for: 0,
        parate_against: 0
      };
      
      // Mappa delle statistiche per fixture_id
      const statsMap = {};
      matchStatsList.forEach(stat => {
        statsMap[stat.fixture_id] = stat;
      });
      
      // Calcola le statistiche totali
      fixtures.forEach(fixture => {
        const matchStats = statsMap[fixture.id];
        if (!matchStats) return;
        
        if (isHome) {
          stats.tiri_for += matchStats.shots_home || 0;
          stats.tiri_against += matchStats.shots_away || 0;
          stats.tiriPorta_for += matchStats.shots_on_target_home || 0;
          stats.tiriPorta_against += matchStats.shots_on_target_away || 0;
          stats.corner_for += matchStats.corners_home || 0;
          stats.corner_against += matchStats.corners_away || 0;
          stats.cornerPT_for += matchStats.corners_ht_home || 0;
          stats.cornerPT_against += matchStats.corners_ht_away || 0;
          stats.falli_for += matchStats.fouls_home || 0;
          stats.falli_against += matchStats.fouls_away || 0;
          stats.cartellini_for += (matchStats.yellow_cards_home || 0) + (matchStats.red_cards_home || 0);
          stats.cartellini_against += (matchStats.yellow_cards_away || 0) + (matchStats.red_cards_away || 0);
          stats.fuorigioco_for += matchStats.offsides_home || 0;
          stats.fuorigioco_against += matchStats.offsides_away || 0;
          stats.parate_for += matchStats.saves_home || 0;
          stats.parate_against += matchStats.saves_away || 0;
        } else {
          stats.tiri_for += matchStats.shots_away || 0;
          stats.tiri_against += matchStats.shots_home || 0;
          stats.tiriPorta_for += matchStats.shots_on_target_away || 0;
          stats.tiriPorta_against += matchStats.shots_on_target_home || 0;
          stats.corner_for += matchStats.corners_away || 0;
          stats.corner_against += matchStats.corners_home || 0;
          stats.cornerPT_for += matchStats.corners_ht_away || 0;
          stats.cornerPT_against += matchStats.corners_ht_home || 0;
          stats.falli_for += matchStats.fouls_away || 0;
          stats.falli_against += matchStats.fouls_home || 0;
          stats.cartellini_for += (matchStats.yellow_cards_away || 0) + (matchStats.red_cards_away || 0);
          stats.cartellini_against += (matchStats.yellow_cards_home || 0) + (matchStats.red_cards_home || 0);
          stats.fuorigioco_for += matchStats.offsides_away || 0;
          stats.fuorigioco_against += matchStats.offsides_home || 0;
          stats.parate_for += matchStats.saves_away || 0;
          stats.parate_against += matchStats.saves_home || 0;
        }
      });
      
      // Calcola le medie
      Object.keys(stats).forEach(key => {
        stats[key] = totalMatches > 0 ? stats[key] / totalMatches : 0;
      });
      
      return stats;
    } catch (error) {
      console.error(`Error calculating stats from fixtures:`, error);
      return {};
    }
  };
  
  // Funzione per suggerire le linee
  const getSuggestedLines = useCallback((category, isFor = true) => {
    if (!match || !category || loading || !avgStats.home || !avgStats.away) {
      console.log("Cannot generate suggested lines", {
        match: !!match,
        category: category,
        loading: loading,
        avgStatsHome: !!avgStats.home,
        avgStatsAway: !!avgStats.away
      });
      return null;
    }
    
    let expectedValue;
    
    // Determina il valore atteso in base alla modalità
    switch(mode) {
      case 'UO_SQUAD':
        // Calcola in base a se stiamo guardando statistiche fatte o subite
        if (isFor) {
          // Calcola la media tra le statistiche "fatte" dalla squadra di casa
          // e quelle "subite" dalla squadra in trasferta
          const homeForValue = avgStats.home[`${category}_for`] || 0;
          const awayAgainstValue = avgStats.away[`${category}_against`] || 0;
          expectedValue = (homeForValue + awayAgainstValue) / 2;
          
          console.log(`UO_SQUAD (FOR): ${category} - Expected value calculation:`, {
            homeForValue,
            awayAgainstValue,
            expectedValue
          });
        } else {
          // Calcola la media tra le statistiche "subite" dalla squadra di casa
          // e quelle "fatte" dalla squadra in trasferta
          const homeAgainstValue = avgStats.home[`${category}_against`] || 0;
          const awayForValue = avgStats.away[`${category}_for`] || 0;
          expectedValue = (homeAgainstValue + awayForValue) / 2;
          
          console.log(`UO_SQUAD (AGAINST): ${category} - Expected value calculation:`, {
            homeAgainstValue,
            awayForValue,
            expectedValue
          });
        }
        break;
        
      case 'UO_MATCH':
        // Per la modalità partita, prendiamo in considerazione entrambe le squadre
        // Sommiamo la media delle statistiche "fatte" da entrambe le squadre
        const homeForValue = avgStats.home[`${category}_for`] || 0;
        const awayForValue = avgStats.away[`${category}_for`] || 0;
        expectedValue = homeForValue + awayForValue;
        
        console.log(`UO_MATCH: ${category} - Expected value calculation:`, {
          homeForValue,
          awayForValue,
          expectedValue
        });
        break;
        
      case 'ONE_X_TWO':
        // Per la modalità 1X2, confrontiamo la media delle "fatte" di entrambe le squadre
        const home1X2Value = avgStats.home[`${category}_for`] || 0;
        const away1X2Value = avgStats.away[`${category}_for`] || 0;
        
        // L'expected value qui è una percentuale di vittoria
        const totalValue = home1X2Value + away1X2Value;
        expectedValue = totalValue > 0 ? (home1X2Value / totalValue) * 100 : 50;
        
        console.log(`ONE_X_TWO: ${category} - Expected value calculation:`, {
          home1X2Value,
          away1X2Value,
          expectedValue
        });
        break;
        
      default:
        expectedValue = 0;
    }
    
    // Calcola le linee suggerite in base all'expected value
    if (mode === 'ONE_X_TWO') {
      // Per 1X2 non abbiamo una linea nel senso tradizionale
      return {
        mainLine: 0, // Non c'è linea per 1X2
        expectedValue, // Percentuale di vittoria attesa
        alternatives: [] // Non ci sono alternative
      };
    } else {
      // Per UO_SQUAD e UO_MATCH, calcoliamo la linea arrotondata a .5
      let mainLine = Math.floor(expectedValue);
      
      // Se il valore è esattamente un intero, sottraiamo 0.5
      if (mainLine === expectedValue) {
        mainLine -= 0.5;
      } else {
        // Altrimenti aggiungiamo 0.5 per arrotondare alla prossima .5
        mainLine += 0.5;
      }
      
      // Generiamo alcune linee alternative (+/- 1.0 e +/- 2.0)
      const alternatives = [
        mainLine - 2,
        mainLine - 1,
        mainLine + 1,
        mainLine + 2
      ].filter(line => line > 0); // Rimuovi linee negative
      
      return {
        mainLine,
        expectedValue,
        alternatives
      };
    }
  }, [avgStats, match, mode, loading]);

  return {
    getSuggestedLines,
    loading,
    debug: {
      avgStats,
      mode,
      matchId: match?.id,
      ...debug
    }
  };
}