// src/components/features/matches/utils/date-formatter.js
/**
 * Formatta una data in formato orario
 * @param {string} dateString - La data da formattare
 * @return {string} - L'orario formattato
 */
export function formatTime(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Errore nella formattazione della data:', e);
      return 'N/A';
    }
  }
  
  /**
   * Formatta una data in formato giorno completo
   * @param {string} dateString - La data da formattare
   * @param {Object} locale - Il locale da utilizzare (default: it)
   * @return {string} - La data formattata
   */
  export function formatFullDay(dateString, locale = 'it') {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      }).toUpperCase();
    } catch (e) {
      console.error('Errore nella formattazione della data completa:', e);
      return 'DATA NON VALIDA';
    }
  }