// src/services/analysis-service.js
import { supabase } from './supabase-client';

/**
 * Servizio per le funzionalità di analisi
 */
export const analysisService = {
  /**
   * Recupera le statistiche di una squadra (in casa o in trasferta)
   * @param {number} teamId - ID della squadra
   * @param {number} leagueId - ID del campionato
   * @param {number} season - Stagione (anno)
   * @param {boolean} isHome - true per stats in casa, false per stats in trasferta
   * @returns {Promise<Object>} - Le statistiche della squadra
   */
  async getTeamStats(teamId, leagueId, season, isHome) {
    try {
      const table = isHome ? 'team_home_stats' : 'team_away_stats';
      
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('team_id', teamId)
        .eq('league_id', leagueId)
        .eq('season', season)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Errore nel recupero delle statistiche ${isHome ? 'in casa' : 'in trasferta'} per la squadra ${teamId}:`, error);
      return null;
    }
  },
  
  /**
   * Recupera tutte le partite di una squadra con le relative statistiche
   * @param {number} teamId - ID della squadra
   * @param {number} leagueId - ID del campionato
   * @param {number} season - Stagione (anno)
   * @returns {Promise<Array>} - Le partite con statistiche
   */
  async getTeamFixturesWithStats(teamId, leagueId, season) {
    try {
      // Recupera tutte le partite in cui la squadra è coinvolta
      const { data: fixtures, error } = await supabase
        .from('fixtures')
        .select(`
          *,
          match_statistics (*)
        `)
        .eq('league_id', leagueId)
        .eq('season', season)
        .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
        .order('date', { ascending: false });
        
      if (error) throw error;
      
      // Filtra solo le partite con statistiche
      return fixtures.filter(fixture => fixture.match_statistics);
    } catch (error) {
      console.error(`Errore nel recupero delle partite per la squadra ${teamId}:`, error);
      return [];
    }
  },
  
  /**
   * Recupera le informazioni su una squadra
   * @param {number} teamId - ID della squadra
   * @returns {Promise<Object>} - Informazioni sulla squadra
   */
  async getTeamInfo(teamId) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Errore nel recupero delle informazioni per la squadra ${teamId}:`, error);
      return null;
    }
  }
};