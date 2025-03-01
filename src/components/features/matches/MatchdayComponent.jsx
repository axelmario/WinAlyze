// src/components/features/matches/MatchdayComponent.jsx
import { MatchCard } from './components/MatchCard';
import { MatchdaySelector } from './components/MatchdaySelector';
import { useFixtures } from './hooks/useFixtures';
import { formatFullDay } from './utils/date-formatter';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { ErrorMessage } from '@/components/common/ErrorMessage';

export function MatchdayComponent({ onMatchSelect, leagueId }) {
  const {
    currentMatchday,
    setCurrentMatchday,
    currentFixtures,
    loading,
    error
  } = useFixtures(leagueId);

  if (loading) {
    return <LoadingIndicator message="Caricamento partite..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  // Raggruppa le partite per data
  const groupMatchesByDate = () => {
    const groups = {};
    
    if (!currentFixtures || currentFixtures.length === 0) {
      return groups;
    }
    
    // Ordina prima le partite per data
    const sortedFixtures = [...currentFixtures].sort((a, b) => {
      const dateA = new Date(a.fixture.date);
      const dateB = new Date(b.fixture.date);
      return dateA - dateB; // Ordine crescente per data/ora
    });
    
    // Ora raggruppa le partite ordinate
    sortedFixtures.forEach(match => {
      if (!match || !match.fixture || !match.fixture.date) return;
      
      const date = new Date(match.fixture.date);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
      const dayName = formatFullDay(match.fixture.date);
      
      if (!groups[dateKey]) {
        groups[dateKey] = {
          dayName,
          matches: []
        };
      }
      groups[dateKey].matches.push(match);
    });
    
    return groups;
  };
  
  const groupedMatches = groupMatchesByDate();

  return (
    <div className="max-w-7xl mx-auto">
      <MatchdaySelector 
        currentMatchday={currentMatchday}
        onMatchdayChange={setCurrentMatchday}
        disabled={loading}
      />
      
      {Object.keys(groupedMatches).length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Nessuna partita trovata per questa giornata.</p>
        </div>
      ) : (
        <MatchesByDateList 
          groupedMatches={groupedMatches} 
          onMatchSelect={onMatchSelect} 
        />
      )}
    </div>
  );
}

// Componente per visualizzare le partite raggruppate per data
function MatchesByDateList({ groupedMatches, onMatchSelect }) {
  // Ordina le date in ordine cronologico
  const sortedDates = Object.keys(groupedMatches).sort();
  
  return (
    <div className="space-y-8">
      {sortedDates.map(dateKey => {
        const { dayName, matches } = groupedMatches[dateKey];
        return (
          <div key={dateKey} className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">
              {dayName}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {matches.map((match) => (
                <MatchCard 
                  key={match.fixture.id} 
                  match={match} 
                  onSelect={onMatchSelect}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}