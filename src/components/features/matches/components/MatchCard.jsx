// src/components/features/matches/components/MatchCard.jsx
import { formatTime } from '../utils/date-formatter';

export function MatchCard({ match, onSelect }) {
  // Assicurati che i dati necessari esistano
  if (!match || !match.fixture || !match.teams) {
    console.warn('Dati partita incompleti:', match);
    return (
      <div className="rounded-lg shadow-md overflow-hidden bg-gray-200 p-4 text-center">
        <p className="text-gray-600">Dati partita non validi</p>
      </div>
    );
  }
  
  // Determina il colore di sfondo in base allo stato della partita
  const getStatusColor = () => {
    const status = match.fixture.status?.short || 'UNKNOWN';
    switch (status) {
      case 'FT': return 'bg-green-100';
      case 'NS': return 'bg-gray-100';
      case '1H':
      case '2H':
      case 'HT': return 'bg-blue-100';
      default: return 'bg-gray-100';
    }
  };
  
  // Ottieni lo stato della partita
  const getStatusText = () => {
    const status = match.fixture.status?.short || 'UNKNOWN';
    return status === 'NS' ? 'Non iniziata' : (match.fixture.status?.long || status);
  };
  
  return (
    <div 
      className={`rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow ${getStatusColor()}`}
      onClick={() => onSelect(match)}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
          <span>{formatTime(match.fixture.date)}</span>
          <span className="font-medium">{getStatusText()}</span>
        </div>
        
        <TeamInfo team={match.teams.home} score={match.goals?.home} />
        <TeamInfo team={match.teams.away} score={match.goals?.away} />
      </div>
    </div>
  );
}

// Componente per le informazioni della squadra
function TeamInfo({ team, score }) {
  return (
    <div className="flex justify-between items-center mb-3">
      <div className="flex items-center">
        <img 
          src={team.logo} 
          alt={team.name} 
          className="h-8 w-8 mr-2"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/30?text=?';
          }}
        />
        <span className="font-medium text-gray-900">{team.name}</span>
      </div>
      <span className="text-lg font-bold">{score ?? '-'}</span>
    </div>
  );
}