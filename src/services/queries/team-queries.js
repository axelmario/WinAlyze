// src/services/queries/team-queries.js
import { supabase } from '../supabase-client';
import { cacheService } from '../cache-service';

export const teamQueries = {
  async getTeamFixtures(teamId, season) {
    try {
      const cacheKey = `team_fixtures:${teamId}:${season}`;
      const cachedData = cacheService.getFromCache(cacheKey);
      if (cachedData) return cachedData;
      
      console.log(`Recupero partite per squadra ${teamId} dal database`);
      const { data, error } = await supabase
        .from('fixtures')
        .select('*')
        .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
        .eq('season', season);
        
      if (error) {
        console.error('Errore nel recupero partite squadra:', error);
        return [];
      }
      
      console.log(`Recuperate ${data?.length || 0} partite per squadra ${teamId}`);
      cacheService.setInCache(cacheKey, data || []);
      return data || [];
    } catch (e) {
      console.error('Eccezione nel recupero partite squadra:', e);
      return [];
    }
  }
};