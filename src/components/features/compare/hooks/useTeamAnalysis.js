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
        
        // Recupera le statistiche direttamente dalle tabelle team_home_stats e team_away_stats
        const [homeTeamStats, awayTeamStats] = await Promise.all([
          supabaseService.getTeamHomeStats(homeTeamId, leagueId, season),
          supabaseService.getTeamAwayStats(awayTeamId, leagueId, season)
        ]);
        
        console.log('Statistiche casa recuperate:', homeTeamStats);
        console.log('Statistiche trasferta recuperate:', awayTeamStats);
        
        if (!homeTeamStats) {
          console.warn(`Nessuna statistica in casa trovata per il team ${homeTeamId}`);
        }
        
        if (!awayTeamStats) {
          console.warn(`Nessuna statistica in trasferta trovata per il team ${awayTeamId}`);
        }
        
        // Formatta le statistiche nel formato atteso dal componente
        setHomeTeam({
          id: homeTeamId,
          expected: {
            home: formatTeamStats(homeTeamStats)
          }
        });
        
        setAwayTeam({
          id: awayTeamId,
          expected: {
            away: formatTeamStats(awayTeamStats)
          }
        });
      } catch (err) {
        console.error('Errore nel caricamento delle statistiche delle squadre:', err);
        setError('Impossibile caricare le statistiche delle squadre. Riprova più tardi.');
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

// Funzione per formattare le statistiche nel formato richiesto dal componente StatsGrid
function formatTeamStats(stats) {
  if (!stats) return null;
  
  return {
    shots: { 
      for: parseFloat(stats.avg_shots_for) || 0, 
      against: parseFloat(stats.avg_shots_against) || 0 
    },
    shotsOnTarget: { 
      for: parseFloat(stats.avg_shots_on_target_for) || 0, 
      against: parseFloat(stats.avg_shots_on_target_against) || 0 
    },
    corners: { 
      for: parseFloat(stats.avg_corners_for) || 0, 
      against: parseFloat(stats.avg_corners_against) || 0 
    },
    firstHalfCorners: { 
      for: parseFloat(stats.avg_corners_ht_for) || 0, 
      against: parseFloat(stats.avg_corners_ht_against) || 0 
    },
    fouls: { 
      for: parseFloat(stats.avg_fouls_for) || 0, 
      against: parseFloat(stats.avg_fouls_against) || 0 
    },
    offsides: { 
      for: parseFloat(stats.avg_offsides_for) || 0, 
      against: parseFloat(stats.avg_offsides_against) || 0 
    },
    cards: { 
      yellow: { 
        for: parseFloat(stats.avg_yellow_cards_for) || 0, 
        against: parseFloat(stats.avg_yellow_cards_against) || 0 
      }, 
      red: { 
        for: parseFloat(stats.avg_red_cards_for) || 0, 
        against: parseFloat(stats.avg_red_cards_against) || 0 
      } 
    },
    saves: { 
      for: parseFloat(stats.avg_saves_for) || 0, 
      against: parseFloat(stats.avg_saves_against) || 0 
    }
  };
}