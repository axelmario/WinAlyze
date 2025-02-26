// src/components/features/matches/hooks/useFixtures.js
import { useState, useEffect } from 'react';
import { supabaseService } from '@/services/supabase-service';
import { findOptimalMatchday, extractMatchdayNumber } from '../utils/matchday-utils';

export function useFixtures(leagueId) {
  const [currentMatchday, setCurrentMatchday] = useState(1);
  const [allFixtures, setAllFixtures] = useState([]);
  const [currentFixtures, setCurrentFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Effetto per caricare tutte le partite una sola volta
  useEffect(() => {
    if (!leagueId) return;
    
    const fetchAllFixtures = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`Recupero tutte le partite per league_id=${leagueId}`);
        
        // Recupera tutte le partite dal database
        const fixtures = await supabaseService.getFixtures(leagueId, 2024);
        
        console.log(`Recuperate ${fixtures?.length || 0} partite dal database`);
        
        if (!fixtures || fixtures.length === 0) {
          setError('Nessuna partita trovata per questo campionato');
          setAllFixtures([]);
          setCurrentFixtures([]);
          setLoading(false);
          return;
        }
        
        // Salva tutte le partite nello state
        setAllFixtures(fixtures);
        
        // Trova qual è la giornata ottimale da mostrare
        if (initialLoad) {
          const optimalMatchday = findOptimalMatchday(fixtures);
          console.log(`Giornata ottimale da mostrare: ${optimalMatchday}`);
          setCurrentMatchday(optimalMatchday);
          setInitialLoad(false);
        }
      } catch (err) {
        console.error('Errore nel recupero partite:', err);
        setError('Impossibile caricare le partite. Riprova più tardi.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllFixtures();
  }, [leagueId, initialLoad]);
  
  // Effetto per filtrare le partite per la giornata corrente
  useEffect(() => {
    if (allFixtures.length === 0) return;
    
    console.log(`Filtraggio partite per giornata ${currentMatchday}`);
    
    const filterFixturesByMatchday = () => {
      // Filtra per la giornata corrente
      const filteredFixtures = allFixtures.filter(fixture => {
        const roundString = fixture.round || fixture.data?.league?.round;
        const fixtureMatchday = extractMatchdayNumber(roundString);
        return fixtureMatchday === currentMatchday;
      });
      
      console.log(`Trovate ${filteredFixtures.length} partite per la giornata ${currentMatchday}`);
      
      // Prepara i dati nel formato atteso dai componenti
      return filteredFixtures.map(fixture => {
        // Se il dato è già nel formato atteso, usalo direttamente
        if (fixture.teams && fixture.fixture && fixture.goals) {
          return fixture;
        }
        
        // Altrimenti, estrai dal campo data se esiste
        if (fixture.data) {
          return fixture.data;
        }
        
        // Come fallback, costruisci un oggetto nel formato atteso
        return {
          fixture: {
            id: fixture.id,
            date: fixture.date,
            status: { 
              short: fixture.status || 'NS',
              long: fixture.status === 'FT' ? 'Terminata' : 
                    fixture.status === 'NS' ? 'Non iniziata' : fixture.status
            }
          },
          teams: {
            home: {
              id: fixture.home_team_id,
              name: fixture.home_team_name || `Squadra ${fixture.home_team_id}`,
              logo: fixture.home_team_logo || 'https://via.placeholder.com/30?text=?'
            },
            away: {
              id: fixture.away_team_id,
              name: fixture.away_team_name || `Squadra ${fixture.away_team_id}`,
              logo: fixture.away_team_logo || 'https://via.placeholder.com/30?text=?'
            }
          },
          goals: {
            home: fixture.score_home,
            away: fixture.score_away
          }
        };
      });
    };
    
    const filteredFixtures = filterFixturesByMatchday();
    setCurrentFixtures(filteredFixtures);
    
  }, [allFixtures, currentMatchday]);
  
  return {
    currentMatchday,
    setCurrentMatchday,
    currentFixtures,
    loading,
    error
  };
}