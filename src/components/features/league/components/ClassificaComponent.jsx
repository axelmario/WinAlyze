// src/components/features/league/components/ClassificaComponent.jsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase-client';

export function ClassificaComponent({ leagueId, season }) {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debug, setDebug] = useState({});
  
  // Stato per l'ordinamento
  const [sortConfig, setSortConfig] = useState({
    key: 'points', // Chiave di default (punti)
    direction: 'descending' // Direzione di default (decrescente)
  });
  
  useEffect(() => {
    const fetchStandings = async () => {
      console.log("Fetching standings with:", { leagueId, season });
      
      if (!leagueId) {
        setError('Dati del campionato mancanti (leagueId)');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Prova a ottenere i dati delle partite completate
        const { data: fixtures, error: fixturesError } = await supabase
          .from('fixtures')
          .select(`
            id,
            league_id,
            season,
            home_team_id,
            away_team_id,
            score_home,
            score_away,
            status,
            date,
            data
          `)
          .eq('league_id', leagueId);
        
        if (fixturesError) {
          console.error("Error fetching fixtures:", fixturesError);
          setError(`Errore nel caricamento delle partite: ${fixturesError.message}`);
          setLoading(false);
          return;
        }
        
        // Filtriamo le partite completate
        const completedFixtures = fixtures.filter(fixture => {
          const status = fixture.status;
          return status === 'FT' || status === 'AET' || status === 'PEN' || 
                 status === 'FINISHED' || (status && status.toUpperCase().includes('FT'));
        });
        
        console.log(`Found ${fixtures.length} fixtures, ${completedFixtures.length} completed`);
        setDebug(prev => ({ ...prev, totalFixtures: fixtures.length, completedFixtures: completedFixtures.length }));
        
        if (completedFixtures.length === 0) {
          setStandings([]);
          setLoading(false);
          setError('Nessuna partita completata trovata per questo campionato');
          return;
        }
        
        // Ottieni tutti i team IDs presenti nelle partite
        const teamIds = new Set();
        completedFixtures.forEach(fixture => {
          if (fixture.home_team_id) teamIds.add(fixture.home_team_id);
          if (fixture.away_team_id) teamIds.add(fixture.away_team_id);
        });
        
        console.log(`Found ${teamIds.size} teams`);
        setDebug(prev => ({ ...prev, teamsCount: teamIds.size }));
        
        if (teamIds.size === 0) {
          setStandings([]);
          setLoading(false);
          setError('Nessuna squadra trovata nelle partite');
          return;
        }
        
        // Fetch dei dati delle squadre
        const { data: teams, error: teamsError } = await supabase
          .from('teams')
          .select('*')
          .in('id', Array.from(teamIds));
        
        if (teamsError) {
          console.error("Error fetching teams:", teamsError);
          setError(`Errore nel caricamento delle squadre: ${teamsError.message}`);
          setLoading(false);
          return;
        }
        
        console.log(`Retrieved ${teams.length} teams data`);
        setDebug(prev => ({ ...prev, teamsDataCount: teams.length }));
        
        // Crea un mapping team_id -> team
        const teamsMap = {};
        teams.forEach(team => {
          teamsMap[team.id] = team;
        });
        
        // Calcola la classifica
        const standingsMap = {};
        
        // Inizializza i dati per ogni squadra
        teamIds.forEach(teamId => {
          standingsMap[teamId] = {
            team_id: teamId,
            team_name: teamsMap[teamId]?.name || `Team ${teamId}`,
            team_logo: teamsMap[teamId]?.logo || '',
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goals_for: 0,
            goals_against: 0,
            points: 0,
            position: 0,
            form: [] // Ultimi 5 risultati (W, D, L)
          };
        });
        
        // Ordina le partite per data (più vecchie prima)
        const sortedFixtures = [...completedFixtures].sort((a, b) => {
          const dateA = new Date(a.date || '2000-01-01');
          const dateB = new Date(b.date || '2000-01-01');
          return dateA - dateB;
        });
        
        // Calcola i punti e le statistiche per ogni squadra
        let validMatchesCount = 0;
        sortedFixtures.forEach(fixture => {
          // Assicurati che ci siano i dati necessari
          if (fixture.score_home === null || fixture.score_away === null ||
              !fixture.home_team_id || !fixture.away_team_id) {
            return;
          }
          
          const homeTeamId = fixture.home_team_id;
          const awayTeamId = fixture.away_team_id;
          const homeScore = parseInt(fixture.score_home, 10) || 0;
          const awayScore = parseInt(fixture.score_away, 10) || 0;
          
          const homeTeam = standingsMap[homeTeamId];
          const awayTeam = standingsMap[awayTeamId];
          
          if (!homeTeam || !awayTeam) return;
          
          validMatchesCount++;
          
          // Aggiorna partite giocate
          homeTeam.played += 1;
          awayTeam.played += 1;
          
          // Aggiorna gol
          homeTeam.goals_for += homeScore;
          homeTeam.goals_against += awayScore;
          awayTeam.goals_for += awayScore;
          awayTeam.goals_against += homeScore;
          
          // Aggiorna punti e vittorie/pareggi/sconfitte
          if (homeScore > awayScore) {
            // Vittoria squadra di casa
            homeTeam.won += 1;
            homeTeam.points += 3;
            awayTeam.lost += 1;
            
            // Aggiorna la forma
            homeTeam.form.push('W');
            awayTeam.form.push('L');
          } else if (homeScore < awayScore) {
            // Vittoria squadra ospite
            awayTeam.won += 1;
            awayTeam.points += 3;
            homeTeam.lost += 1;
            
            // Aggiorna la forma
            homeTeam.form.push('L');
            awayTeam.form.push('W');
          } else {
            // Pareggio
            homeTeam.drawn += 1;
            awayTeam.drawn += 1;
            homeTeam.points += 1;
            awayTeam.points += 1;
            
            // Aggiorna la forma
            homeTeam.form.push('D');
            awayTeam.form.push('D');
          }
          
          // Limita la forma alle ultime 5 partite
          if (homeTeam.form.length > 5) homeTeam.form = homeTeam.form.slice(-5);
          if (awayTeam.form.length > 5) awayTeam.form = awayTeam.form.slice(-5);
        });
        
        console.log(`Processed ${validMatchesCount} valid matches for standings`);
        setDebug(prev => ({ ...prev, validMatchesCount }));
        
        // Converti la mappa in array
        const standingsArray = Object.values(standingsMap);
        
        // Calcola la differenza reti per ogni squadra
        standingsArray.forEach(team => {
          team.goal_difference = team.goals_for - team.goals_against;
        });
        
        // Ordina per punti, differenza reti, gol fatti (default)
        const initialSortedStandings = sortData(standingsArray, sortConfig.key, sortConfig.direction);
        
        // Assegna le posizioni
        initialSortedStandings.forEach((team, index) => {
          team.position = index + 1;
        });
        
        console.log(`Generated standings with ${initialSortedStandings.length} teams`);
        setDebug(prev => ({ ...prev, standingsTeamsCount: initialSortedStandings.length }));
        
        setStandings(initialSortedStandings);
      } catch (err) {
        console.error('Error calculating standings:', err);
        setError(`Errore nel calcolo della classifica: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStandings();
  }, [leagueId, season]);
  
  // Funzione per gestire il click sull'intestazione della colonna
  const handleSortClick = (key) => {
    // Se è già ordinato per questa chiave, inverti la direzione
    if (sortConfig.key === key) {
      setSortConfig({
        key,
        direction: sortConfig.direction === 'ascending' ? 'descending' : 'ascending'
      });
    } else {
      // Altrimenti, ordina per la nuova chiave in base al tipo di dato
      // Per default, numeri in ordine decrescente, nomi in ordine crescente
      let direction = 'descending';
      if (key === 'team_name') {
        direction = 'ascending';
      }
      setSortConfig({ key, direction });
    }
  };
  
  // Funzione per ordinare i dati in base al sortConfig attuale
  const sortData = (data, key, direction) => {
    return [...data].sort((a, b) => {
      // Per le posizioni, usare sempre i punti, differenza reti e gol fatti
      if (key === 'position') {
        // Prima ordinare per punti
        if (a.points !== b.points) {
          return direction === 'ascending' ? a.points - b.points : b.points - a.points;
        }
        
        // Se i punti sono uguali, ordina per differenza reti
        const aDiff = a.goals_for - a.goals_against;
        const bDiff = b.goals_for - b.goals_against;
        if (aDiff !== bDiff) {
          return direction === 'ascending' ? aDiff - bDiff : bDiff - aDiff;
        }
        
        // Se anche la differenza reti è uguale, ordina per gol fatti
        return direction === 'ascending' ? a.goals_for - b.goals_for : b.goals_for - a.goals_for;
      }
      
      // Per il nome della squadra (ordine alfabetico)
      if (key === 'team_name') {
        const nameA = a.team_name.toLowerCase();
        const nameB = b.team_name.toLowerCase();
        
        if (nameA < nameB) return direction === 'ascending' ? -1 : 1;
        if (nameA > nameB) return direction === 'ascending' ? 1 : -1;
        return 0;
      }
      
      // Per la differenza reti
      if (key === 'goal_difference') {
        const aDiff = a.goals_for - a.goals_against;
        const bDiff = b.goals_for - b.goals_against;
        return direction === 'ascending' ? aDiff - bDiff : bDiff - aDiff;
      }
      
      // Per tutte le altre colonne numeriche
      return direction === 'ascending' ? a[key] - b[key] : b[key] - a[key];
    });
  };
  
  // Ordina i dati ogni volta che sortConfig cambia
  useEffect(() => {
    if (standings.length > 0) {
      const sortedData = sortData(standings, sortConfig.key, sortConfig.direction);
      
      // Aggiorna le posizioni se è ordinato per 'position'
      if (sortConfig.key === 'position') {
        sortedData.forEach((team, index) => {
          team.position = index + 1;
        });
      }
      
      setStandings(sortedData);
    }
  }, [sortConfig]);
  
  // Funzione per renderizzare i cerchi colorati della forma recente
  const renderFormCircle = (result) => {
    switch (result) {
      case 'W':
        return <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>;
      case 'D':
        return <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1"></span>;
      case 'L':
        return <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>;
      default:
        return <span className="inline-block w-3 h-3 rounded-full bg-gray-300 mr-1"></span>;
    }
  };
  
  // Funzione per renderizzare le frecce di ordinamento
  const renderSortArrow = (columnName) => {
    if (sortConfig.key !== columnName) {
      return null;
    }
    
    return (
      <span className="inline-block ml-1">
        {sortConfig.direction === 'ascending' ? '▲' : '▼'}
      </span>
    );
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          Caricamento classifica...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="text-xl text-red-600 mb-4">{error}</div>
        <div className="text-sm text-gray-700 bg-gray-100 p-3 rounded">
          <strong>Debug Info:</strong> 
          <pre>{JSON.stringify(debug, null, 2)}</pre>
          <p className="mt-2">LeagueID: {leagueId || 'non specificato'}</p>
          <p>Season: {season || 'non specificata'}</p>
        </div>
      </div>
    );
  }

  if (standings.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="text-xl text-gray-600 mb-4">Nessun dato disponibile per la classifica</div>
        <div className="text-sm text-gray-700 bg-gray-100 p-3 rounded">
          <strong>Debug Info:</strong> 
          <pre>{JSON.stringify(debug, null, 2)}</pre>
          <p className="mt-2">LeagueID: {leagueId || 'non specificato'}</p>
          <p>Season: {season || 'non specificata'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-100 text-gray-700 text-sm">
            <th 
              className="py-2 px-3 text-left cursor-pointer hover:bg-gray-200"
              onClick={() => handleSortClick('position')}
            >
              POS {renderSortArrow('position')}
            </th>
            <th 
              className="py-2 px-3 text-left cursor-pointer hover:bg-gray-200"
              onClick={() => handleSortClick('team_name')}
            >
              SQUADRA {renderSortArrow('team_name')}
            </th>
            <th 
              className="py-2 px-3 text-center cursor-pointer hover:bg-gray-200"
              onClick={() => handleSortClick('played')}
            >
              PG {renderSortArrow('played')}
            </th>
            <th 
              className="py-2 px-3 text-center cursor-pointer hover:bg-gray-200"
              onClick={() => handleSortClick('won')}
            >
              V {renderSortArrow('won')}
            </th>
            <th 
              className="py-2 px-3 text-center cursor-pointer hover:bg-gray-200"
              onClick={() => handleSortClick('drawn')}
            >
              N {renderSortArrow('drawn')}
            </th>
            <th 
              className="py-2 px-3 text-center cursor-pointer hover:bg-gray-200"
              onClick={() => handleSortClick('lost')}
            >
              P {renderSortArrow('lost')}
            </th>
            <th 
              className="py-2 px-3 text-center cursor-pointer hover:bg-gray-200"
              onClick={() => handleSortClick('goals_for')}
            >
              GF {renderSortArrow('goals_for')}
            </th>
            <th 
              className="py-2 px-3 text-center cursor-pointer hover:bg-gray-200"
              onClick={() => handleSortClick('goals_against')}
            >
              GS {renderSortArrow('goals_against')}
            </th>
            <th 
              className="py-2 px-3 text-center cursor-pointer hover:bg-gray-200"
              onClick={() => handleSortClick('goal_difference')}
            >
              DR {renderSortArrow('goal_difference')}
            </th>
            <th className="py-2 px-3 text-center">
              FORMA
            </th>
            <th 
              className="py-2 px-3 text-center cursor-pointer hover:bg-gray-200"
              onClick={() => handleSortClick('points')}
            >
              PTI {renderSortArrow('points')}
            </th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team) => (
            <tr 
              key={team.team_id} 
              className="border-b border-gray-200 hover:bg-gray-50"
            >
              <td className="py-2 px-3 text-center font-medium">{team.position}</td>
              <td className="py-2 px-3">
                <div className="flex items-center">
                  {team.team_logo && (
                    <img 
                      src={team.team_logo} 
                      alt={team.team_name} 
                      className="w-6 h-6 mr-2"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  )}
                  <span className="font-medium">{team.team_name}</span>
                </div>
              </td>
              <td className="py-2 px-3 text-center">{team.played}</td>
              <td className="py-2 px-3 text-center">{team.won}</td>
              <td className="py-2 px-3 text-center">{team.drawn}</td>
              <td className="py-2 px-3 text-center">{team.lost}</td>
              <td className="py-2 px-3 text-center">{team.goals_for}</td>
              <td className="py-2 px-3 text-center">{team.goals_against}</td>
              <td className="py-2 px-3 text-center">
                {team.goals_for - team.goals_against > 0 ? '+' : ''}
                {team.goals_for - team.goals_against}
              </td>
              <td className="py-2 px-3">
                <div className="flex justify-center">
                  {team.form && team.form.slice(-5).map((result, index) => (
                    <div key={index}>{renderFormCircle(result)}</div>
                  ))}
                </div>
              </td>
              <td className="py-2 px-3 text-center font-bold">{team.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}