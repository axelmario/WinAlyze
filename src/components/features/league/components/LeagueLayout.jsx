// src/components/features/league/LeagueLayout.jsx
import { useState } from 'react';
import { LeagueHeader } from './components/LeagueHeader';
import { MatchdayComponent } from '../matches/MatchdayComponent';
import { ApiMonitor } from '@/components/common/ApiMonitor';
import { getLeagueApiId } from './utils/league';

export default function LeagueLayout({ league }) {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [activeView, setActiveView] = useState('giornata');
  const [matchView, setMatchView] = useState('confronto');
  const leagueApiId = getLeagueApiId(league?.id);

  // Se c'è una partita selezionata
  if (selectedMatch) {
    return (
      <div className="flex flex-col h-full">
        <LeagueHeader 
          league={league}
          onChangeLeague={() => window.location.href = '/'}
          activeView={activeView}
          onViewChange={setActiveView}
        />
        <main className="flex-1 bg-gray-50">
          <div className="h-[calc(100%-88px)]">
            <div className="bg-white border-b border-gray-200 px-6 py-4">
              <button
                onClick={() => setSelectedMatch(null)}
                className="text-blue-600 hover:text-blue-800 font-medium block"
              >
                ← Torna alla Giornata
              </button>
            </div>

            <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200">
              <button
                onClick={() => setMatchView('confronto')}
                disabled={matchView === 'confronto'}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <h2 className="text-xl font-bold text-gray-900">
                {matchView === 'confronto' ? 'Confronto' : 'Analisi'}
              </h2>

              <button
                onClick={() => setMatchView('analisi')}
                disabled={matchView === 'analisi'}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-auto">
              {matchView === 'confronto' ? (
                <div className="p-6">
                  <h3 className="text-xl text-center text-gray-500">
                    Funzionalità di confronto in sviluppo
                  </h3>
                </div>
              ) : (
                <div className="p-6">
                  <h3 className="text-xl text-center text-gray-500">
                    Funzionalità di analisi in sviluppo
                  </h3>
                </div>
              )}
            </div>
          </div>
        </main>
        <ApiMonitor />
      </div>
    );
  }

  // Funzione per renderizzare il contenuto principale
  const renderMainContent = () => {
    switch (activeView) {
      case 'giornata':
        return (
          <MatchdayComponent 
            leagueId={leagueApiId}
            onMatchSelect={setSelectedMatch}
          />
        );
      case 'classifica':
        return (
          <div className="p-6 text-center">
            <h3 className="text-xl text-gray-500">Funzionalità classifica in sviluppo</h3>
          </div>
        );
      case 'rendimenti':
        return (
          <div className="p-6 text-center">
            <h3 className="text-xl text-gray-500">Funzionalità rendimenti in sviluppo</h3>
          </div>
        );
      case 'arbitri':
        return (
          <div className="p-6 text-center">
            <h3 className="text-xl text-gray-500">Funzionalità arbitri in sviluppo</h3>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <LeagueHeader 
        league={league}
        onChangeLeague={() => window.location.href = '/'}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      <main className="flex-1 bg-gray-50 p-6">
        {renderMainContent()}
      </main>

      <ApiMonitor />
    </div>
  );
}