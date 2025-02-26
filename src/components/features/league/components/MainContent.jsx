// src/components/features/league/components/MainContent.jsx
import { MatchdayComponent } from '../../matches/MatchdayComponent';

export function MainContent({ activeView, leagueApiId, onMatchSelect }) {
  const renderContent = () => {
    switch (activeView) {
      case 'giornata':
        return (
          <MatchdayComponent 
            leagueId={leagueApiId}
            onMatchSelect={onMatchSelect}
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
    <main className="flex-1 bg-gray-50 p-6">
      {renderContent()}
    </main>
  );
}