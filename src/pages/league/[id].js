// src/pages/league/[id].js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { supabaseService } from '@/services/supabase-service';
import LeagueLayout from '@/components/features/league/LeagueLayout';

export default function LeaguePage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [league, setLeague] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!id) return;
    
    const fetchLeague = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const leagueData = await supabaseService.getLeague(id);
        
        if (!leagueData) {
          setError('Campionato non trovato');
          return;
        }
        
        setLeague(leagueData);
      } catch (err) {
        console.error('Errore nel recupero campionato:', err);
        setError('Impossibile caricare il campionato. Riprova più tardi.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeague();
  }, [id]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-gray-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          Caricamento campionato...
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }
  
  return <LeagueLayout league={league} />;
}