// src/services/queries/fixture-queries.js
import { supabase } from '../supabase-client';
import { cacheService } from '../cache-service';

export const fixtureQueries = {
  async getFixtures(leagueId, season) {
    try {
      const cacheKey = `fixtures:${leagueId}:${season}`;
      const cachedData = cacheService.getFromCache(cacheKey);
      if (cachedData) return cachedData;
      
      console.log(`Recupero partite per lega ${leagueId} dal database`);
      const { data, error } = await supabase
        .from('fixtures')
        .select('*')
        .eq('league_id', leagueId)
        .eq('season', season);
        
      if (error) {
        console.error('Errore nel recupero partite:', error);
        return [];
      }
      
      console.log(`Recuperate ${data?.length || 0} partite`);
      cacheService.setInCache(cacheKey, data || []);
      return data || [];
    } catch (e) {
      console.error('Eccezione nel recupero partite:', e);
      return [];
    }
  },
  
  async getMatchStatistics(fixtureId) {
    try {
      const cacheKey = `match_statistics:${fixtureId}`;
      const cachedData = cacheService.getFromCache(cacheKey);
      if (cachedData) return cachedData;
      
      console.log(`Recupero statistiche per partita ${fixtureId} dal database`);
      const { data, error } = await supabase
        .from('match_statistics')
        .select('*')
        .eq('fixture_id', fixtureId)
        .single();
        
      if (error) {
        console.error('Errore nel recupero statistiche partita:', error);
        return null;
      }
      
      cacheService.setInCache(cacheKey, data);
      return data;
    } catch (e) {
      console.error('Eccezione nel recupero statistiche partita:', e);
      return null;
    }
  }
};