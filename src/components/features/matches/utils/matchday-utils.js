// src/components/features/matches/utils/matchday-utils.js
/**
 * Trova la giornata ottimale da mostrare inizialmente
 * @param {Array} fixtures - Le partite del campionato
 * @return {number} - Il numero della giornata da mostrare
 */
export function findOptimalMatchday(fixtures) {
    if (!fixtures || fixtures.length === 0) return 1;
  
    // Trova l'ultima giornata giocata o la prossima da giocare
    const now = new Date();
    
    // Estrai il numero di giornata da una partita
    const getMatchdayFromFixture = (fixture) => {
      const roundString = fixture.round || fixture.data?.league?.round;
      if (!roundString) return null;
      
      const match = roundString.match(/Matchday (\d+)/i) || 
                   roundString.match(/Regular Season - (\d+)/i);
      return match ? parseInt(match[1]) : null;
    };
    
    // Estrai la data di una partita
    const getDateFromFixture = (fixture) => {
      const dateString = fixture.date || fixture.data?.fixture?.date;
      return dateString ? new Date(dateString) : null;
    };
    
    // Definisci stato della partita (giocata o no)
    const isMatchPlayed = (fixture) => {
      const status = fixture.status || fixture.data?.fixture?.status?.short;
      return status === 'FT' || status === 'AET' || status === 'PEN';
    };
    
    // Raggruppa le partite per giornata
    const matchdayGroups = {};
    fixtures.forEach(fixture => {
      const matchday = getMatchdayFromFixture(fixture);
      if (matchday === null) return;
      
      if (!matchdayGroups[matchday]) {
        matchdayGroups[matchday] = [];
      }
      matchdayGroups[matchday].push(fixture);
    });
    
    // Trova l'ultima giornata completamente giocata
    let lastCompletedMatchday = 0;
    Object.entries(matchdayGroups).forEach(([matchday, fixtures]) => {
      const allPlayed = fixtures.every(isMatchPlayed);
      if (allPlayed && parseInt(matchday) > lastCompletedMatchday) {
        lastCompletedMatchday = parseInt(matchday);
      }
    });
    
    // Trova la prossima giornata con partite
    let nextMatchday = null;
    let minDaysUntilNext = Infinity;
    
    Object.entries(matchdayGroups).forEach(([matchday, fixtures]) => {
      // Considera solo giornate non completamente giocate
      if (fixtures.some(f => !isMatchPlayed(f))) {
        const upcomingMatches = fixtures.filter(f => !isMatchPlayed(f));
        
        // Trova la partita più vicina nel tempo
        upcomingMatches.forEach(match => {
          const matchDate = getDateFromFixture(match);
          if (matchDate) {
            const daysUntil = (matchDate - now) / (1000 * 60 * 60 * 24);
            
            // Se è una partita futura ed è più vicina delle precedenti
            if (daysUntil >= 0 && daysUntil < minDaysUntilNext) {
              minDaysUntilNext = daysUntil;
              nextMatchday = parseInt(matchday);
            }
          }
        });
      }
    });
    
    // Priorità: prossima giornata, ultima giocata, o prima giornata
    return nextMatchday || lastCompletedMatchday || 1;
  }
  
  /**
   * Estrae il numero della giornata da una stringa
   * @param {string} roundString - La stringa contenente il numero di giornata
   * @return {number|null} - Il numero della giornata o null se non trovato
   */
  export function extractMatchdayNumber(roundString) {
    if (!roundString) return null;
    
    const match = roundString.match(/Matchday (\d+)/i) || 
                 roundString.match(/Regular Season - (\d+)/i);
    return match ? parseInt(match[1]) : null;
  }