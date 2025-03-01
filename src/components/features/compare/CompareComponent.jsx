// src/components/features/compare/CompareComponent.jsx
import { useState } from 'react';
import { StatBar } from './components/StatBar';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { useTeamAnalysis } from './hooks/useTeamAnalysis';

export function CompareComponent({ match }) {
  // Controlla se la partita è già stata giocata
  const isMatchPlayed = () => {
    if (!match || !match.fixture || !match.fixture.status) return false;
    const status = match.fixture.status.short;
    return status === 'FT' || status === 'AET' || status === 'PEN';
  };

  // Se la partita è già stata giocata, mostra un messaggio
  if (isMatchPlayed()) {
    return (
      <div className="w-full bg-gray-50 p-6">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-bold text-gray-700 mb-2">Partita già disputata</h2>
          <p className="text-gray-600">
            Il confronto statistico è disponibile solo per le partite future.
          </p>
        </div>
      </div>
    );
  }

  // Recupera i dati delle squadre
  const { homeTeam, awayTeam, loading, error } = useTeamAnalysis(match);

  if (loading) {
    return <LoadingIndicator message="Caricamento statistiche..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!match || !homeTeam?.expected?.home || !awayTeam?.expected?.away) {
    return (
      <div className="w-full bg-gray-50 p-6 text-center">
        <p className="text-gray-600">Dati insufficienti per l'analisi.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 p-4">
      {/* Titolo */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Confronto</h1>
      </div>
      
      {/* Header con stemmi e nomi squadre */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-center gap-3">
            <img 
              src={match.teams.home.logo} 
              alt={match.teams.home.name}
              className="w-20 h-20"
            />
            <span className="text-xl font-bold text-gray-900">{match.teams.home.name}</span>
          </div>
          <div className="text-4xl font-bold text-gray-400">VS</div>
          <div className="flex flex-col items-center gap-3">
            <img 
              src={match.teams.away.logo} 
              alt={match.teams.away.name}
              className="w-20 h-20"
            />
            <span className="text-xl font-bold text-gray-900">{match.teams.away.name}</span>
          </div>
        </div>
      </div>
      
      {/* Statistiche */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tiri Attesi */}
        <StatisticCard 
          title="Tiri Attesi"
          homeLogo={match.teams.home.logo}
          awayLogo={match.teams.away.logo}
          stats={[
            {
              label: "Tiri Effettuati",
              home: homeTeam.expected.home.shots?.for || 0,
              away: awayTeam.expected.away.shots?.for || 0,
              isNegative: false
            },
            {
              label: "Tiri Subiti",
              home: homeTeam.expected.home.shots?.against || 0,
              away: awayTeam.expected.away.shots?.against || 0,
              isNegative: true
            }
          ]}
          expectedValues={calculateExpectedValues(
            homeTeam, 
            awayTeam, 
            'shots'
          )}
        />
        
        {/* Tiri in Porta Attesi */}
        <StatisticCard 
          title="Tiri in Porta Attesi"
          homeLogo={match.teams.home.logo}
          awayLogo={match.teams.away.logo}
          stats={[
            {
              label: "Tiri in Porta Effettuati",
              home: homeTeam.expected.home.shotsOnTarget?.for || 0,
              away: awayTeam.expected.away.shotsOnTarget?.for || 0,
              isNegative: false
            },
            {
              label: "Tiri in Porta Subiti",
              home: homeTeam.expected.home.shotsOnTarget?.against || 0,
              away: awayTeam.expected.away.shotsOnTarget?.against || 0,
              isNegative: true
            }
          ]}
          expectedValues={calculateExpectedValues(
            homeTeam, 
            awayTeam, 
            'shotsOnTarget'
          )}
        />
        
        {/* Corner Attesi */}
        <StatisticCard 
          title="Corner Attesi"
          homeLogo={match.teams.home.logo}
          awayLogo={match.teams.away.logo}
          stats={[
            {
              label: "Corner Effettuati",
              home: homeTeam.expected.home.corners?.for || 0,
              away: awayTeam.expected.away.corners?.for || 0,
              isNegative: false
            },
            {
              label: "Corner Subiti",
              home: homeTeam.expected.home.corners?.against || 0,
              away: awayTeam.expected.away.corners?.against || 0,
              isNegative: true
            }
          ]}
          expectedValues={calculateExpectedValues(
            homeTeam, 
            awayTeam, 
            'corners'
          )}
        />
        
        {/* Corner 1° Tempo Attesi */}
        <StatisticCard 
          title="Corner 1° Tempo Attesi"
          homeLogo={match.teams.home.logo}
          awayLogo={match.teams.away.logo}
          stats={[
            {
              label: "Corner 1° Tempo Effettuati",
              home: homeTeam.expected.home.firstHalfCorners?.for || 0,
              away: awayTeam.expected.away.firstHalfCorners?.for || 0,
              isNegative: false
            },
            {
              label: "Corner 1° Tempo Subiti",
              home: homeTeam.expected.home.firstHalfCorners?.against || 0,
              away: awayTeam.expected.away.firstHalfCorners?.against || 0,
              isNegative: true
            }
          ]}
          expectedValues={calculateExpectedValues(
            homeTeam, 
            awayTeam, 
            'firstHalfCorners'
          )}
        />
        
        {/* Falli Attesi */}
        <StatisticCard 
          title="Falli Attesi"
          homeLogo={match.teams.home.logo}
          awayLogo={match.teams.away.logo}
          stats={[
            {
              label: "Falli Commessi",
              home: homeTeam.expected.home.fouls?.for || 0,
              away: awayTeam.expected.away.fouls?.for || 0,
              isNegative: true
            },
            {
              label: "Falli Subiti",
              home: homeTeam.expected.home.fouls?.against || 0,
              away: awayTeam.expected.away.fouls?.against || 0,
              isNegative: false
            }
          ]}
          expectedValues={calculateExpectedValues(
            homeTeam, 
            awayTeam, 
            'fouls'
          )}
        />
        
        {/* Cartellini Gialli Attesi */}
        <StatisticCard 
          title="Cartellini Gialli Attesi"
          homeLogo={match.teams.home.logo}
          awayLogo={match.teams.away.logo}
          stats={[
            {
              label: "Cartellini Gialli Ricevuti",
              home: homeTeam.expected.home.cards?.yellow?.for || 0,
              away: awayTeam.expected.away.cards?.yellow?.for || 0,
              isNegative: true
            },
            {
              label: "Cartellini Gialli Provocati",
              home: homeTeam.expected.home.cards?.yellow?.against || 0,
              away: awayTeam.expected.away.cards?.yellow?.against || 0,
              isNegative: false
            }
          ]}
          expectedValues={calculateExpectedValues(
            homeTeam, 
            awayTeam, 
            'yellowCards'
          )}
        />
        
        {/* Parate Attese */}
        <StatisticCard 
          title="Parate Attese"
          homeLogo={match.teams.home.logo}
          awayLogo={match.teams.away.logo}
          stats={[
            {
              label: "Parate Effettuate",
              home: homeTeam.expected.home.saves?.for || 0,
              away: awayTeam.expected.away.saves?.for || 0,
              isNegative: false
            },
            {
              label: "Parate Subite",
              home: homeTeam.expected.home.saves?.against || 0,
              away: awayTeam.expected.away.saves?.against || 0,
              isNegative: true
            }
          ]}
          expectedValues={calculateExpectedValues(
            homeTeam, 
            awayTeam, 
            'saves'
          )}
        />
        
        {/* Fuorigioco Attesi */}
        <StatisticCard 
          title="Fuorigioco Attesi"
          homeLogo={match.teams.home.logo}
          awayLogo={match.teams.away.logo}
          stats={[
            {
              label: "Fuorigioco Commessi",
              home: homeTeam.expected.home.offsides?.for || 0,
              away: awayTeam.expected.away.offsides?.for || 0,
              isNegative: true
            },
            {
              label: "Fuorigioco Provocati",
              home: homeTeam.expected.home.offsides?.against || 0,
              away: awayTeam.expected.away.offsides?.against || 0,
              isNegative: false
            }
          ]}
          expectedValues={calculateExpectedValues(
            homeTeam, 
            awayTeam, 
            'offsides'
          )}
        />
      </div>
    </div>
  );
}

// Componente per la scheda di una statistica
function StatisticCard({ title, homeLogo, awayLogo, stats, expectedValues }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <img src={homeLogo} alt="" className="w-8 h-8" />
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <img src={awayLogo} alt="" className="w-8 h-8" />
      </div>
      
      <div className="space-y-6">
        {stats.map((stat, index) => (
          <div key={index} className="space-y-2">
            <div className="text-sm font-medium text-gray-700">{stat.label}</div>
            <StatBar
              homeValue={stat.home}
              awayValue={stat.away}
              isNegative={stat.isNegative}
            />
          </div>
        ))}
      </div>
      
      {/* Valori attesi */}
      {expectedValues && (
        <div className="mt-5 pt-4 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-500 mb-3">Valori Attesi</div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Casa</div>
              <div className="font-semibold text-gray-900">{expectedValues.home.toFixed(2)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Totale</div>
              <div className="font-semibold text-gray-900">{expectedValues.total.toFixed(2)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Trasferta</div>
              <div className="font-semibold text-gray-900">{expectedValues.away.toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Funzione per calcolare i valori attesi
function calculateExpectedValues(homeTeam, awayTeam, category) {
  if (!homeTeam?.expected?.home || !awayTeam?.expected?.away) return null;

  // Ottiene i valori base per entrambe le squadre in base alla categoria
  const getValues = () => {
    let homeFor, homeAgainst, awayFor, awayAgainst;
    
    switch(category) {
      case 'shots':
        homeFor = homeTeam.expected.home.shots?.for || 0;
        homeAgainst = homeTeam.expected.home.shots?.against || 0;
        awayFor = awayTeam.expected.away.shots?.for || 0;
        awayAgainst = awayTeam.expected.away.shots?.against || 0;
        break;
      case 'shotsOnTarget':
        homeFor = homeTeam.expected.home.shotsOnTarget?.for || 0;
        homeAgainst = homeTeam.expected.home.shotsOnTarget?.against || 0;
        awayFor = awayTeam.expected.away.shotsOnTarget?.for || 0;
        awayAgainst = awayTeam.expected.away.shotsOnTarget?.against || 0;
        break;
      case 'corners':
        homeFor = homeTeam.expected.home.corners?.for || 0;
        homeAgainst = homeTeam.expected.home.corners?.against || 0;
        awayFor = awayTeam.expected.away.corners?.for || 0;
        awayAgainst = awayTeam.expected.away.corners?.against || 0;
        break;
      case 'firstHalfCorners':
        homeFor = homeTeam.expected.home.firstHalfCorners?.for || 0;
        homeAgainst = homeTeam.expected.home.firstHalfCorners?.against || 0;
        awayFor = awayTeam.expected.away.firstHalfCorners?.for || 0;
        awayAgainst = awayTeam.expected.away.firstHalfCorners?.against || 0;
        break;
      case 'fouls':
        homeFor = homeTeam.expected.home.fouls?.for || 0;
        homeAgainst = homeTeam.expected.home.fouls?.against || 0;
        awayFor = awayTeam.expected.away.fouls?.for || 0;
        awayAgainst = awayTeam.expected.away.fouls?.against || 0;
        break;
      case 'yellowCards':
        homeFor = homeTeam.expected.home.cards?.yellow?.for || 0;
        homeAgainst = homeTeam.expected.home.cards?.yellow?.against || 0;
        awayFor = awayTeam.expected.away.cards?.yellow?.for || 0;
        awayAgainst = awayTeam.expected.away.cards?.yellow?.against || 0;
        break;
      case 'saves':
        homeFor = homeTeam.expected.home.saves?.for || 0;
        homeAgainst = homeTeam.expected.home.saves?.against || 0;
        awayFor = awayTeam.expected.away.saves?.for || 0;
        awayAgainst = awayTeam.expected.away.saves?.against || 0;
        break;
      case 'offsides':
        homeFor = homeTeam.expected.home.offsides?.for || 0;
        homeAgainst = homeTeam.expected.home.offsides?.against || 0;
        awayFor = awayTeam.expected.away.offsides?.for || 0;
        awayAgainst = awayTeam.expected.away.offsides?.against || 0;
        break;
      default:
        homeFor = 0;
        homeAgainst = 0;
        awayFor = 0;
        awayAgainst = 0;
    }

    // Calcola i valori attesi
    const expectedHome = (homeFor + awayAgainst) / 2;
    const expectedAway = (awayFor + homeAgainst) / 2;

    return {
      home: expectedHome,
      away: expectedAway,
      total: expectedHome + expectedAway
    };
  };

  return getValues();
}