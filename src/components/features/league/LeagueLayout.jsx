// src/components/features/league/LeagueLayout.jsx
import { useState, useEffect } from 'react';
import { LeagueHeader } from './components/LeagueHeader';
import { MatchView } from './components/MatchView';
import { MainContent } from './components/MainContent';
import { ClassificaComponent } from './components/ClassificaComponent'; // Importa il componente Classifica
import { getLeagueApiId } from './utils/league';

export default function LeagueLayout({ league }) {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [activeView, setActiveView] = useState('giornata');
  const [matchView, setMatchView] = useState('confronto');

  // Log per debug dei dati di league
  useEffect(() => {
    console.log("LeagueLayout received league data:", league);
  }, [league]);

  // Ottieni leagueApiId in modo sicuro
  const leagueApiId = getLeagueApiId(league?.id);
  const leagueId = league?.id;
  const season = league?.current_season || league?.season || "2023-2024";

  // Se c'è una partita selezionata, mostra la vista partita
  if (selectedMatch) {
    return (
      <div className="flex flex-col h-full">
        <LeagueHeader 
          league={league}
          onChangeLeague={() => window.location.href = '/'}
          activeView={activeView}
          onViewChange={setActiveView}
        />
        <MatchView 
          match={selectedMatch}
          matchView={matchView}
          setMatchView={setMatchView}
          onBack={() => setSelectedMatch(null)}
        />
      </div>
    );
  }

  // Altrimenti mostra la vista principale
  return (
    <div className="flex flex-col h-full">
      <LeagueHeader 
        league={league}
        onChangeLeague={() => window.location.href = '/'}
        activeView={activeView}
        onViewChange={setActiveView}
      />
      
      {/* Debug info - visualizzato solo se necessario */}
      {false && (
        <div className="bg-gray-100 p-2 text-xs">
          <div>LeagueID: {leagueId || 'non disponibile'}</div>
          <div>Season: {season || 'non disponibile'}</div>
          <div>LeagueApiID: {leagueApiId || 'non disponibile'}</div>
          <div>ActiveView: {activeView}</div>
          <pre>{JSON.stringify(league, null, 2)}</pre>
        </div>
      )}
      
      {/* Mostra la MainContent solo quando activeView è 'giornata' */}
      {activeView === 'giornata' && (
        <MainContent 
          activeView={activeView}
          leagueApiId={leagueApiId}
          onMatchSelect={setSelectedMatch}
        />
      )}
      
      {/* Mostra la ClassificaComponent quando activeView è 'classifica' */}
      {activeView === 'classifica' && (
        <div className="container mx-auto px-4 py-6">
          <ClassificaComponent 
            leagueId={leagueId}
            season={season}
          />
        </div>
      )}
      
      {/* Messaggio temporaneo per le viste non ancora implementate */}
      {(activeView === 'rendimenti' || activeView === 'arbitri') && (
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-600">
            Sezione in costruzione
          </div>
        </div>
      )}
    </div>
  );
}