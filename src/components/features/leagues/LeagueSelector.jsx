// src/components/features/leagues/LeagueSelector.jsx
import { useState, useEffect } from 'react';
import { supabaseService } from '@/services/supabase-service';
import Link from 'next/link';

export function LeagueSelector() {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const leaguesData = await supabaseService.getLeagues();
        setLeagues(leaguesData);
      } catch (err) {
        console.error('Errore nel recupero leghe:', err);
        setError('Impossibile caricare le leghe. Riprova più tardi.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeagues();
  }, []);
  
  // Funzione per raggruppare le leghe per paese/categoria
  const groupLeaguesByCountry = () => {
    const groupedLeagues = {};
    
    leagues.forEach(league => {
      if (!groupedLeagues[league.country]) {
        groupedLeagues[league.country] = [];
      }
      groupedLeagues[league.country].push(league);
    });
    
    return groupedLeagues;
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          Caricamento campionati...
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }
  
  const groupedLeagues = groupLeaguesByCountry();
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Seleziona un Campionato</h1>
      
      <div className="space-y-10">
        {Object.entries(groupedLeagues).map(([country, countryLeagues]) => (
          <div key={country}>
            <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">{country}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {countryLeagues.map(league => (
                <Link 
                  href={`/league/${league.id}`} 
                  key={league.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6 flex flex-col items-center">
                    <img 
                      src={league.logo} 
                      alt={league.name} 
                      className="h-24 w-24 object-contain mb-4"
                    />
                    <h3 className="text-lg font-semibold text-center text-gray-900">{league.name}</h3>
                    <p className="text-sm text-gray-600">{league.country}</p>
                    <p className="text-xs text-gray-500">Stagione {league.season}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}