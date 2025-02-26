// src/services/supabase-service.js
import { cacheService } from './cache-service';
import { leagueQueries } from './queries/league-queries';
import { fixtureQueries } from './queries/fixture-queries';
import { teamQueries } from './queries/team-queries';

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
}

// Esporta un'istanza
export const supabaseService = new SupabaseService();