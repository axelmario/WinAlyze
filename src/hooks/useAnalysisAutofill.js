// src/components/features/analysis/hooks/useAnalysisAutofill.js
import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase-client';

/**
 * Hook per suggerire automaticamente le linee di scommessa
 * @param {string} mode - Modalità di analisi (UO_SQUAD, UO_MATCH, ONE_X_TWO)
 * @param {Object} match - La partita selezionata
 * @returns {Object} - Funzioni per suggerire le linee
 */
export function useAnalysisAutofill(mode, match) {
  const [teamStats, setTeamStats] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Carica le statistiche delle squadre per il calcolo delle linee
  useEffect(() => {
    if (!match) return;
    
    const loadTeamStats = async () => {
      try {
        setLoading(true);
        const homeTeamId = match.teams.home.id;
        const awayTeamId = match.teams.away.id;
        const leagueId = match.league.id;
        const season = match.league.season || 2024;
        
        // Carica le statistiche delle squadre in casa e trasferta
        const [homeStatsResponse, awayStatsResponse] = await Promise.all([
          supabase.from('team_home_stats')
            .select('*')
            .eq('team_id', homeTeamId)
            .eq('league_id', leagueId)
            .eq('season', season)
            .single(),
          supabase.from('team_away_stats')
            .select('*')
            .eq('team_id', awayTeamId)
            .eq('league_id', leagueId)
            .eq('season', season)
            .single()
        ]);
        
        setTeamStats({
          home: homeStatsResponse.data || {},
          away: awayStatsResponse.data || {}
        });
      } catch (error) {
        console.error('Errore nel caricamento delle statistiche per le linee suggerite:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadTeamStats();
  }, [match]);
  
  /**
   * Calcola le linee suggerite in base alla categoria
   * @param {string} category - Categoria statistica
   * @param {boolean} isFor - true per valori "per", false per valori "against" (solo per UO_SQUAD)
   * @returns {Object|null} - Linee suggerite
   */
  const getSuggestedLines = (category, isFor = true) => {
    if (!match || !category || loading || !teamStats.home || !teamStats.away) return null;
    
    // Mappa le categorie ai nomi delle colonne nel database
    const getCategoryColumn = (cat) => {
      switch(cat) {
        case 'tiri': return 'avg_shots';
        case 'tiriPorta': return 'avg_shots_on_target';
        case 'corner': return 'avg_corners';
        case 'cornerPT': return 'avg_corners_ht';
        case 'falli': return 'avg_fouls';
        case 'cartellini': return 'avg_yellow_cards';
        case 'fuorigioco': return 'avg_offsides';
        case 'parate': return 'avg_saves';
        default: return null;
      }
    };
    
    const columnBase = getCategoryColumn(category);
    if (!columnBase) return null;
    
    let expectedValue;
    
    switch(mode) {
      case 'UO_SQUAD':
        // Per UO_SQUAD, consideriamo solo la squadra che stiamo analizzando
        if (isFor) {
          // Valori "for"
          const homeFor = teamStats.home[`${columnBase}_for`] || 0;
          const awayAgainst = teamStats.away[`${columnBase}_against`] || 0;
          expectedValue = (homeFor + awayAgainst) / 2;
        } else {
          // Valori "against"
          const homeAgainst = teamStats.home[`${columnBase}_against`] || 0;
          const awayFor = teamStats.away[`${columnBase}_for`] || 0;
          expectedValue = (homeAgainst + awayFor) / 2;
        }
        break;
        
      case 'UO_MATCH':
        // Per UO_MATCH, sommiamo i valori di entrambe le squadre
        const homeExpected = (teamStats.home[`${columnBase}_for`] || 0) + 
                            (teamStats.away[`${columnBase}_against`] || 0);
        const awayExpected = (teamStats.away[`${columnBase}_for`] || 0) + 
                            (teamStats.home[`${columnBase}_against`] || 0);
        expectedValue = (homeExpected + awayExpected) / 2;
        break;
        
      default:
        return null;
    }
    
    return generateSuggestedLines(expectedValue);
  };
  
  /**
   * Genera un insieme di linee suggerite basate su un valore atteso
   * @param {number} expectedValue - Valore statistico atteso
   * @returns {Object} - Linee suggerite
   */
  const generateSuggestedLines = (expectedValue) => {
    if (expectedValue === 0) return null;
    
    // Arrotonda a 0.5 più vicino per la linea principale
    const decimal = expectedValue % 1;
    let mainLine;
    
    if (decimal <= 0.25) mainLine = Math.floor(expectedValue) + 0.5;
    else if (decimal >= 0.75) mainLine = Math.ceil(expectedValue) + 0.5;
    else mainLine = Math.round(expectedValue) + 0.5;
    
    // Genera linee alternative attorno alla linea principale
    const lines = [
      Math.max(0.5, mainLine - 1),
      mainLine - 0.5,
      mainLine,
      mainLine + 0.5,
      mainLine + 1
    ];
    
    return {
      mainLine: mainLine,
      allLines: [...new Set(lines)].sort((a, b) => a - b),
      expectedValue: expectedValue
    };
  };
  
  return {
    getSuggestedLines,
    loading
  };
}