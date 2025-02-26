// src/components/features/league/utils/league.js
export function getLeagueApiId(leagueId) {
    if (!leagueId) return null;
    return parseInt(leagueId);
  }