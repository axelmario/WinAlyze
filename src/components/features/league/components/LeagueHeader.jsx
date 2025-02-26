// src/components/features/league/components/LeagueHeader.jsx
export function LeagueHeader({ 
    league, 
    onChangeLeague, 
    activeView = 'giornata', 
    onViewChange
  }) {
    return (
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              {league ? (
                <>
                  <img src={league.logo} alt={league.name} className="h-10 w-10 mr-3" />
                  <h1 className="text-2xl font-bold text-gray-900">{league.name}</h1>
                </>
              ) : (
                <h1 className="text-2xl font-bold text-gray-900">Caricamento...</h1>
              )}
            </div>
            <button 
              onClick={onChangeLeague}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
            >
              Cambia Campionato
            </button>
          </div>
  
          <div className="flex space-x-4">
            <NavButton 
              label="Giornata" 
              isActive={activeView === 'giornata'} 
              onClick={() => onViewChange('giornata')}
            />
            <NavButton 
              label="Classifica" 
              isActive={activeView === 'classifica'} 
              onClick={() => onViewChange('classifica')}
            />
            <NavButton 
              label="Rendimenti" 
              isActive={activeView === 'rendimenti'} 
              onClick={() => onViewChange('rendimenti')}
            />
            <NavButton 
              label="Arbitri" 
              isActive={activeView === 'arbitri'} 
              onClick={() => onViewChange('arbitri')}
            />
          </div>
        </div>
      </div>
    );
  }
  
  function NavButton({ label, isActive, onClick }) {
    return (
      <button
        onClick={onClick}
        className={`px-4 py-2 rounded-lg transition-colors ${
          isActive 
            ? 'bg-blue-600 text-white' 
            : 'bg-white text-gray-700 hover:bg-gray-100'
        }`}
      >
        {label}
      </button>
    );
  }