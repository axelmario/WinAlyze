// src/services/queries/league-queries.js
import { supabase } from '../supabase-client';
import { cacheService } from '../cache-service';

export const leagueQueries = {
  async getLeagues() {
    try {
      const cacheKey = 'leagues';
      const cachedData = cacheService.getFromCache(cacheKey);
      if (cachedData) return cachedData;
      
      console.log('Recupero leghe dal database');
      const { data, error } = await supabase
        .from('leagues')
        .select('*')
        .order('id');
        
      if (error) {
        console.error('Errore nel recupero leghe:', error);
        return [];
      }
      
      console.log(`Recuperate ${data?.length || 0} leghe`);
      cacheService.setInCache(cacheKey, data || []);
      return data || [];
    } catch (e) {
      console.error('Eccezione nel recupero leghe:', e);
      return [];
    }
  },
  
  async getLeague(leagueId) {
    try {
      const cacheKey = `league:${leagueId}`;
      const cachedData = cacheService.getFromCache(cacheKey);
      if (cachedData) return cachedData;
      
      console.log(`Recupero lega ${leagueId} dal database`);
      const { data, error } = await supabase
        .from('leagues')
        .select('*')
        .eq('id', leagueId)
        .single();
        
      if (error) {
        console.error(`Errore nel recupero lega ${leagueId}:`, error);
        return null;
      }
      
      cacheService.setInCache(cacheKey, data);
      return data;
    } catch (e) {
      console.error(`Eccezione nel recupero lega ${leagueId}:`, e);
      return null;
    }
  }
};