// src/components/features/league/LeagueLayout.jsx
import { useState } from 'react';
import { LeagueHeader } from './components/LeagueHeader';
import { MatchView } from './components/MatchView';
import { MainContent } from './components/MainContent';
import { getLeagueApiId } from './utils/league';

export default function LeagueLayout({ league }) {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [activeView, setActiveView] = useState('giornata');
  const [matchView, setMatchView] = useState('confronto');
  const leagueApiId = getLeagueApiId(league?.id);

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
      <MainContent 
        activeView={activeView}
        leagueApiId={leagueApiId}
        onMatchSelect={setSelectedMatch}
      />
    </div>
  );
}