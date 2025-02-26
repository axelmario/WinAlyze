// src/components/features/compare/CompareComponent.jsx
import { useState, useEffect } from 'react';
import { StatsGrid } from './components/StatsGrid';
import { LoadingIndicator } from '@/components/common/LoadingIndicator';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { useTeamAnalysis } from './hooks/useTeamAnalysis';
import { STATS_CATEGORIES } from './utils/stats';

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
    <div className="w-full bg-gray-50 p-6">
      <div className="space-y-6">
        {/* Header con stemmi e nomi squadre */}
        <MatchHeader match={match} />

        {/* Griglie delle statistiche */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Object.entries(STATS_CATEGORIES).map(([category, categoryConfig]) => {
            const expectedValues = calculateExpectedValues(
              homeTeam,
              awayTeam,
              categoryConfig.stats[0].key
            );

            return (
              <StatsGrid 
                key={category}
                title={categoryConfig.expectedLabel}
                stats={categoryConfig.stats.map(stat => ({
                  label: stat.label,
                  home: getStatValue(homeTeam.expected.home, stat.key),
                  away: getStatValue(awayTeam.expected.away, stat.key),
                  isNegative: stat.isNegative
                }))}
                homeLogo={match.teams.home.logo}
                awayLogo={match.teams.away.logo}
                expectedValues={expectedValues}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Componente per l'intestazione della partita
function MatchHeader({ match }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          <img 
            src={match.teams.home.logo} 
            alt={match.teams.home.name}
            className="w-20 h-20"
          />
          <span className="text-3xl font-bold text-gray-900">{match.teams.home.name}</span>
        </div>
        <div className="text-4xl font-bold text-gray-400">VS</div>
        <div className="flex items-center gap-6">
          <span className="text-3xl font-bold text-gray-900">{match.teams.away.name}</span>
          <img 
            src={match.teams.away.logo} 
            alt={match.teams.away.name}
            className="w-20 h-20"
          />
        </div>
      </div>
    </div>
  );
}

// Funzione per calcolare i valori attesi
function calculateExpectedValues(homeTeam, awayTeam, category) {
  if (!homeTeam?.expected?.home || !awayTeam?.expected?.away) return null;

  // Ottiene i valori base per entrambe le squadre
  const getValues = (stat) => {
    const homeFor = getStatValue(homeTeam.expected.home, stat);
    const homeAgainst = getStatValue(homeTeam.expected.home, `${stat}Against`);
    const awayFor = getStatValue(awayTeam.expected.away, stat);
    const awayAgainst = getStatValue(awayTeam.expected.away, `${stat}Against`);

    // Calcola i valori attesi
    const expectedHome = (homeFor + awayAgainst) / 2;
    const expectedAway = (awayFor + homeAgainst) / 2;

    return {
      home: expectedHome,
      away: expectedAway,
      total: expectedHome + expectedAway
    };
  };

  return getValues(category);
}

// Funzione helper per ottenere i valori dalle statistiche
function getStatValue(stats, key) {
  if (!stats) return 0;
  switch(key) {
    case 'shots': return stats.shots?.for || 0;
    case 'shotsAgainst': return stats.shots?.against || 0;
    case 'shotsOnTarget': return stats.shotsOnTarget?.for || 0;
    case 'shotsOnTargetAgainst': return stats.shotsOnTarget?.against || 0;
    case 'corners': return stats.corners?.for || 0;
    case 'cornersAgainst': return stats.corners?.against || 0;
    case 'firstHalfCorners': return stats.firstHalfCorners?.for || 0;
    case 'firstHalfCornersAgainst': return stats.firstHalfCorners?.against || 0;
    case 'fouls': return stats.fouls?.for || 0;
    case 'foulsAgainst': return stats.fouls?.against || 0;
    case 'offsides': return stats.offsides?.for || 0;
    case 'offsidesAgainst': return stats.offsides?.against || 0;
    case 'yellowCards': return stats.cards?.yellow?.for || 0;
    case 'yellowCardsAgainst': return stats.cards?.yellow?.against || 0;
    case 'saves': return stats.saves?.for || 0;
    case 'savesAgainst': return stats.saves?.against || 0;
    default: return 0;
  }
}