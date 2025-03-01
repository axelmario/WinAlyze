// src/components/features/analysis/hooks/useAnalysis.js
import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase-client';

export function useAnalysis(match) {
  const [teamsStats, setTeamsStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Caricamento dati
  useEffect(() => {
    const loadData = async () => {
      if (!match || !match.teams || !match.teams.home || !match.teams.away) {
        console.log("useAnalysis: Dati match incompleti", match);
        setError("Dati della partita incompleti");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("useAnalysis: Caricamento dati per", {
          leagueId: match.league?.id,
          season: match.league?.season,
          homeTeamId: match.teams.home.id,
          awayTeamId: match.teams.away.id
        });
        
        // Fetch dei dati per entrambe le squadre
        const [homeStats, awayStats] = await Promise.all([
          fetchTeamStatsWithFixtures(match.league.id, match.league.season, match.teams.home.id),
          fetchTeamStatsWithFixtures(match.league.id, match.league.season, match.teams.away.id)
        ]);

        // Imposta i dati nello stato
        const stats = {
          [match.teams.home.id]: homeStats,
          [match.teams.away.id]: awayStats
        };
        
        console.log("useAnalysis: Dati caricati", {
          homeTeamFixtures: homeStats?.fixturesStats?.length || 0,
          awayTeamFixtures: awayStats?.fixturesStats?.length || 0
        });
        
        setTeamsStats(stats);
      } catch (err) {
        console.error('useAnalysis: Errore', err);
        setError('Errore nel caricamento delle statistiche');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [match]);

  // Fetch dei dati di una squadra e delle sue partite
  const fetchTeamStatsWithFixtures = async (leagueId, season, teamId) => {
    try {
      // Fetch dei dati della squadra
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();
      
      if (teamError) {
        console.error('Errore caricamento squadra:', teamError);
        return { team: null, fixturesStats: [] };
      }
      
      // Fetch delle partite senza limiti
      const { data: fixtures, error: fixturesError } = await supabase
        .from('fixtures')
        .select(`
          id,
          date,
          league_id,
          season,
          home_team_id,
          away_team_id,
          status,
          round,
          score_home,
          score_away,
          data
        `)
        .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
        .eq('league_id', leagueId)
        .eq('season', season)
        .order('date', { ascending: false });
      
      if (fixturesError) {
        console.error('Errore caricamento partite:', fixturesError);
        return { team: teamData, fixturesStats: [] };
      }
      
      console.log(`Caricate ${fixtures.length} partite per la squadra ${teamId}`);
      
      if (fixtures.length === 0) {
        return { team: teamData, fixturesStats: [] };
      }
      
      // Fetch delle statistiche per ogni partita
      const fixtureIds = fixtures.map(fixture => fixture.id);
      const { data: matchStatsList, error: statsError } = await supabase
        .from('match_statistics')
        .select('*')
        .in('fixture_id', fixtureIds);
      
      if (statsError) {
        console.error('Errore caricamento statistiche:', statsError);
        // Continua comunque, potremmo avere partite senza statistiche
      }
      
      // Crea un mapping delle statistiche per fixture_id
      const statsMap = {};
      if (matchStatsList && matchStatsList.length > 0) {
        matchStatsList.forEach(stats => {
          statsMap[stats.fixture_id] = stats;
        });
      }
      
      // Prepara i dati delle partite con nomi e loghi delle squadre
      const fixturesStats = fixtures.map(fixture => {
        // Estrai i nomi e i loghi delle squadre dal campo data JSON
        let home_team_name = '';
        let away_team_name = '';
        let home_team_logo = '';
        let away_team_logo = '';
        
        try {
          if (fixture.data) {
            const dataObj = typeof fixture.data === 'string' ? JSON.parse(fixture.data) : fixture.data;
            if (dataObj.teams) {
              if (dataObj.teams.home) {
                home_team_name = dataObj.teams.home.name || '';
                home_team_logo = dataObj.teams.home.logo || '';
              }
              if (dataObj.teams.away) {
                away_team_name = dataObj.teams.away.name || '';
                away_team_logo = dataObj.teams.away.logo || '';
              }
            }
          }
        } catch (e) {
          console.error('Errore parsing fixture data:', e);
        }
        
        // Ottieni le statistiche corrispondenti
        const stats = statsMap[fixture.id] || null;
        
        // Costruisci l'oggetto fixture
        return {
          id: fixture.id,
          date: fixture.date,
          home_team_id: fixture.home_team_id,
          away_team_id: fixture.away_team_id,
          status: fixture.status,
          score_home: fixture.score_home,
          score_away: fixture.score_away,
          home_team_name,
          away_team_name,
          home_team_logo,
          away_team_logo,
          match_statistics: stats ? {
            shots_home: stats.shots_home || 0,
            shots_away: stats.shots_away || 0,
            shots_on_target_home: stats.shots_on_target_home || 0,
            shots_on_target_away: stats.shots_on_target_away || 0,
            corners_home: stats.corners_home || 0,
            corners_away: stats.corners_away || 0,
            corners_ht_home: stats.corners_ht_home || 0,
            corners_ht_away: stats.corners_ht_away || 0,
            fouls_home: stats.fouls_home || 0,
            fouls_away: stats.fouls_away || 0,
            yellow_cards_home: stats.yellow_cards_home || 0,
            yellow_cards_away: stats.yellow_cards_away || 0,
            red_cards_home: stats.red_cards_home || 0,
            red_cards_away: stats.red_cards_away || 0,
            offsides_home: stats.offsides_home || 0,
            offsides_away: stats.offsides_away || 0,
            saves_home: stats.saves_home || 0,
            saves_away: stats.saves_away || 0
          } : null
        };
      });
      
      return {
        team: teamData,
        fixturesStats
      };
    } catch (error) {
      console.error('Errore generale in fetchTeamStatsWithFixtures:', error);
      return { team: null, fixturesStats: [] };
    }
  };

  return {
    teamsStats,
    loading,
    error
  };
}