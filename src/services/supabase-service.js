// src/services/supabase-service.js
import { cacheService } from './cache-service';
import { leagueQueries } from './queries/league-queries';
import { fixtureQueries } from './queries/fixture-queries';
import { teamQueries } from './queries/team-queries';
import { supabase } from './supabase-client';  // Importa direttamente il client Supabase

class SupabaseService {
  constructor() {
    console.log('Servizio Supabase inizializzato');
  }
  
  // Leghe
  getLeagues = leagueQueries.getLeagues;
  getLeague = leagueQueries.getLeague;
  
  // Partite
  getFixtures = fixtureQueries.getFixtures;
  getMatchStatistics = fixtureQueries.getMatchStatistics;
  
  // Squadre
  getTeamFixtures = teamQueries.getTeamFixtures;
  
  /**
   * Recupera le statistiche medie di una squadra quando gioca in casa
   * @param {number} teamId - ID della squadra
   * @param {number} leagueId - ID del campionato
   * @param {number} season - Stagione (anno)
   * @returns {Promise<Object>} - Le statistiche della squadra in casa
   */
  async getTeamHomeStats(teamId, leagueId, season) {
    try {
      // Usa direttamente il client Supabase importato
      const { data, error } = await supabase
        .from('team_home_stats')
        .select('*')
        .eq('team_id', teamId)
        .eq('league_id', leagueId)
        .eq('season', season)
        .single();
        
      if (error) {
        console.error('Errore nel recupero delle statistiche casa:', error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('Eccezione nel recupero delle statistiche casa:', err);
      return null;
    }
  }

  /**
   * Recupera le statistiche medie di una squadra quando gioca in trasferta
   * @param {number} teamId - ID della squadra
   * @param {number} leagueId - ID del campionato
   * @param {number} season - Stagione (anno)
   * @returns {Promise<Object>} - Le statistiche della squadra in trasferta
   */
  async getTeamAwayStats(teamId, leagueId, season) {
    try {
      // Usa direttamente il client Supabase importato
      const { data, error } = await supabase
        .from('team_away_stats')
        .select('*')
        .eq('team_id', teamId)
        .eq('league_id', leagueId)
        .eq('season', season)
        .single();
        
      if (error) {
        console.error('Errore nel recupero delle statistiche trasferta:', error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('Eccezione nel recupero delle statistiche trasferta:', err);
      return null;
    }
  }
}

// Esporta un'istanza
export const supabaseService = new SupabaseService();