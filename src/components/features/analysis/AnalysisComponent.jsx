// src/components/features/analysis/AnalysisComponent.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAnalysis } from './hooks/useAnalysis';
import { useAnalysisAutofill } from './hooks/useAnalysisAutofill';
import { TeamMatches } from './components/TeamMatches';
import ValueBadge from './components/ValueBadge';
import { ModeSelector } from './components/ModeSelector';
import { CATEGORIES } from './utils/analysis';
import DebugInfo from './components/DebugInfo';

export function AnalysisComponent({ match }) {
  // Stato locale dell'analisi
  const [mode, setMode] = useState('UO_SQUAD');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [lineValue, setLineValue] = useState('');
  const [lineError, setLineError] = useState('');
  const [isReversed, setIsReversed] = useState(false);
  const [suggestedLines, setSuggestedLines] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  
  // Carica i dati delle partite e delle squadre
  const { teamsStats, loading, error } = useAnalysis(match);
  
  // Hook per suggerire automaticamente le linee
  const { getSuggestedLines, loading: loadingAutofill, debug: autofillDebug } = useAnalysisAutofill(mode, match);

  // Definisci handleCategoryChange come useCallback per evitare ricreazioni non necessarie
  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
  }, []);
  // Funzione per validare e formattare il valore della linea
  const validateLineValue = (value) => {
    // Se il valore è vuoto, resetta l'errore e il valore
    if (value === '') {
      setLineError('');
      setLineValue('');
      return;
    }
    
    // Accetta solo numeri interi durante la digitazione
    if (/^\d+$/.test(value)) {
      setLineValue(value);
      setLineError('');
      return;
    }
    
    // Accetta numeri con .5 (es: 10.5)
    if (/^\d+\.5$/.test(value)) {
      setLineValue(value);
      setLineError('');
      return;
    }
    
    // Accetta numeri con . alla fine (temporaneamente durante digitazione)
    if (/^\d+\.$/.test(value)) {
      setLineValue(value);
      setLineError('');
      return;
    }
    
    // Se arriva qui, è un formato non valido
    setLineError('Inserisci solo numeri interi o con .5 (es. 10, 10.5)');
  };

  // Gestisce la formattazione quando l'input perde il focus
  const handleInputBlur = () => {
    if (!lineValue) return;
    
    // Se è un numero intero, aggiungi .5
    if (/^\d+$/.test(lineValue)) {
      setLineValue(lineValue + '.5');
      setLineError('');
      return;
    }
    
    // Se termina con ., aggiungi 5
    if (lineValue.endsWith('.')) {
      setLineValue(lineValue + '5');
      setLineError('');
      return;
    }
    
    // Se contiene un punto ma non termina con .5, formatta correttamente
    if (lineValue.includes('.') && !lineValue.endsWith('.5')) {
      const numValue = parseInt(lineValue);
      setLineValue(numValue + '.5');
      setLineError('');
    }
  };

  // Funzione per incrementare o decrementare la linea di 1.0 (mantenendo .5)
  const adjustLineValue = (increment) => {
    if (!lineValue) {
      // Se non c'è valore, imposta un valore di default
      setLineValue(increment ? '0.5' : '0.5');
      return;
    }
    
    const currentValue = parseFloat(lineValue);
    if (isNaN(currentValue)) return;
    
    // Aggiungi o sottrai 1.0 (invece di 0.5)
    // Poi assicurati che termini sempre con .5
    let newValue;
    
    if (increment) {
      // Incrementa di 1.0
      newValue = Math.floor(currentValue + 1) + 0.5;
    } else {
      // Decrementa di 1.0, ma non sotto 0.5
      newValue = Math.max(0.5, Math.floor(currentValue - 1) + 0.5);
    }
    
    // Formatta il valore
    setLineValue(newValue.toString());
    setLineError('');
  };

  // Funzione per gestire il click su una linea suggerita
  const handleSuggestedLineClick = (value) => {
    setLineValue(value.toString());
    setLineError('');
  };

  // Funzione per gestire lo switch tra effettuati e subiti
  const handleSwitch = () => {
    const newReversedState = !isReversed;
    setIsReversed(newReversedState);
    
    if (selectedCategory) {
      const newSuggestions = getSuggestedLines(selectedCategory, newReversedState);
      if (newSuggestions && newSuggestions.mainLine) {
        setLineValue(newSuggestions.mainLine.toString());
        setSuggestedLines(newSuggestions);
      }
    }
  };

  // Funzione che aggiorna il modo in cui viene gestito il cambio di modalità
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setSelectedCategory(''); // Reset della categoria quando si cambia modalità
    setLineValue(''); // Reset del valore della linea
    setSuggestedLines(null); // Reset delle linee suggerite
  };
  // Effetto per aggiornare le linee suggerite quando cambia la categoria
  useEffect(() => {
    if (!selectedCategory || !match?.teams?.home?.id || !match?.teams?.away?.id) {
      setLineValue('');
      setSuggestedLines(null);
      return;
    }

    console.log(`Requesting suggested lines for category: ${selectedCategory}, isReversed: ${!isReversed}`);
    const suggestions = getSuggestedLines(selectedCategory, !isReversed);
    
    if (suggestions) {
      console.log('Setting suggested lines:', suggestions);
      if (suggestions.mainLine) {
        setLineValue(suggestions.mainLine.toString());
      }
      setSuggestedLines(suggestions);
    } else {
      console.log('No suggested lines received');
    }
  }, [selectedCategory, getSuggestedLines, isReversed, match]);

  // Seleziona una categoria di default quando si carica il componente
  useEffect(() => {
    if (!selectedCategory && mode === 'UO_SQUAD' && CATEGORIES.UO_SQUAD.length > 0) {
      handleCategoryChange(CATEGORIES.UO_SQUAD[0].id);
    } else if (!selectedCategory && mode === 'UO_MATCH' && CATEGORIES.UO_MATCH.length > 0) {
      handleCategoryChange(CATEGORIES.UO_MATCH[0].id);
    } else if (!selectedCategory && mode === 'ONE_X_TWO' && CATEGORIES.ONE_X_TWO.length > 0) {
      handleCategoryChange(CATEGORIES.ONE_X_TWO[0].id);
    }
  }, [mode, selectedCategory, handleCategoryChange]);
  
  // Aggiungi keyboard shortcut per debug
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Mostra/nascondi debug con Ctrl+D
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        setShowDebug(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Stato di caricamento
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          Caricamento statistiche...
        </div>
      </div>
    );
  }

  // Stato di errore
  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-6 p-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Analisi</h1>
      </div>
      
      {/* Selezione modalità */}
      <div className="flex justify-center space-x-4">
        <ModeSelector mode={mode} onChange={handleModeChange} />
      </div>

      {/* Selezione categoria */}
      <div className="space-y-6">
        <div className="flex justify-center space-x-4 flex-wrap gap-2">
          {CATEGORIES[mode].map(category => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
        {/* 1X2 Mode - ValueBadge */}
        {mode === 'ONE_X_TWO' && selectedCategory && (
          <ValueBadge 
            mode={mode}
            expectedValue1={suggestedLines?.expectedValue || 0}
            expectedValue2={suggestedLines?.expectedValue || 0}
            percentage1={(() => {
              try {
                if (!match?.teams?.home?.id || 
                    !teamsStats || 
                    !teamsStats[match.teams.home.id] || 
                    !teamsStats[match.teams.home.id].fixturesStats) {
                  return 0;
                }
                
                const teamId = match.teams.home.id;
                // Filtriamo per le partite in casa della squadra di casa
                const fixtures = teamsStats[teamId].fixturesStats.filter(m => 
                  m && m.home_team_id === teamId && m.match_statistics
                );
                
                if (!fixtures.length) return 0;
                
                const totalMatches = fixtures.length;
                const matchesWon = fixtures.filter(m => {
                  if (!m.match_statistics) return false;
                  
                  let homeValue = 0, awayValue = 0;

                  if (selectedCategory === 'cornerPT') {
                    homeValue = m.match_statistics.corners_ht_home || 0;
                    awayValue = m.match_statistics.corners_ht_away || 0;
                  } else if (selectedCategory === 'cartellini') {
                    homeValue = (m.match_statistics.yellow_cards_home || 0) + 
                              (m.match_statistics.red_cards_home || 0);
                    awayValue = (m.match_statistics.yellow_cards_away || 0) + 
                              (m.match_statistics.red_cards_away || 0);
                  } else {
                    // Ottiene la statistica in base al tipo
                    switch(selectedCategory) {
                      case 'tiri': 
                        homeValue = m.match_statistics.shots_home || 0;
                        awayValue = m.match_statistics.shots_away || 0;
                        break;
                      case 'tiriPorta': 
                        homeValue = m.match_statistics.shots_on_target_home || 0;
                        awayValue = m.match_statistics.shots_on_target_away || 0;
                        break;
                      case 'corner': 
                        homeValue = m.match_statistics.corners_home || 0;
                        awayValue = m.match_statistics.corners_away || 0;
                        break;
                      case 'falli': 
                        homeValue = m.match_statistics.fouls_home || 0;
                        awayValue = m.match_statistics.fouls_away || 0;
                        break;
                      case 'fuorigioco': 
                        homeValue = m.match_statistics.offsides_home || 0;
                        awayValue = m.match_statistics.offsides_away || 0;
                        break;
                      case 'parate': 
                        homeValue = m.match_statistics.saves_home || 0;
                        awayValue = m.match_statistics.saves_away || 0;
                        break;
                      default: 
                        return false;
                    }
                  }

                  return homeValue > awayValue;
                }).length;

                return (matchesWon / totalMatches) * 100;
              } catch (error) {
                console.error('Error calculating percentage1 for 1X2:', error);
                return 0;
              }
            })()}
            percentage2={(() => {
              try {
                if (!match?.teams?.away?.id || 
                    !teamsStats || 
                    !teamsStats[match.teams.away.id] || 
                    !teamsStats[match.teams.away.id].fixturesStats) {
                  return 0;
                }
                
                const teamId = match.teams.away.id;
                // Filtriamo per le partite in trasferta della squadra ospite
                const fixtures = teamsStats[teamId].fixturesStats.filter(m => 
                  m && m.away_team_id === teamId && m.match_statistics
                );
                
                if (!fixtures.length) return 0;
                
                const totalMatches = fixtures.length;
                const matchesWon = fixtures.filter(m => {
                  if (!m.match_statistics) return false;
                  
                  let homeValue = 0, awayValue = 0;

                  if (selectedCategory === 'cornerPT') {
                    homeValue = m.match_statistics.corners_ht_home || 0;
                    awayValue = m.match_statistics.corners_ht_away || 0;
                  } else if (selectedCategory === 'cartellini') {
                    homeValue = (m.match_statistics.yellow_cards_home || 0) + 
                              (m.match_statistics.red_cards_home || 0);
                    awayValue = (m.match_statistics.yellow_cards_away || 0) + 
                              (m.match_statistics.red_cards_away || 0);
                  } else {
                    // Ottiene la statistica in base al tipo
                    switch(selectedCategory) {
                      case 'tiri': 
                        homeValue = m.match_statistics.shots_home || 0;
                        awayValue = m.match_statistics.shots_away || 0;
                        break;
                      case 'tiriPorta': 
                        homeValue = m.match_statistics.shots_on_target_home || 0;
                        awayValue = m.match_statistics.shots_on_target_away || 0;
                        break;
                      case 'corner': 
                        homeValue = m.match_statistics.corners_home || 0;
                        awayValue = m.match_statistics.corners_away || 0;
                        break;
                      case 'falli': 
                        homeValue = m.match_statistics.fouls_home || 0;
                        awayValue = m.match_statistics.fouls_away || 0;
                        break;
                      case 'fuorigioco': 
                        homeValue = m.match_statistics.offsides_home || 0;
                        awayValue = m.match_statistics.offsides_away || 0;
                        break;
                      case 'parate': 
                        homeValue = m.match_statistics.saves_home || 0;
                        awayValue = m.match_statistics.saves_away || 0;
                        break;
                      default: 
                        return false;
                    }
                  }

                  return awayValue > homeValue;
                }).length;

                return (matchesWon / totalMatches) * 100;
              } catch (error) {
                console.error('Error calculating percentage2 for 1X2:', error);
                return 0;
              }
            })()}
          />
        )}
        {/* U/O Modes - Input della linea migliorato */}
        {mode !== 'ONE_X_TWO' && selectedCategory && CATEGORIES[mode].find(cat => cat.id === selectedCategory)?.hasLine && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-medium text-gray-900 w-24">Linea</span>
              <div className="flex items-center gap-2 flex-1">
                {/* Pulsante decremento */}
                <button 
                  onClick={() => adjustLineValue(false)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Input della linea */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={lineValue}
                    onChange={(e) => validateLineValue(e.target.value)}
                    onBlur={handleInputBlur}
                    className={`w-full p-2 border rounded-md text-gray-900 ${lineError ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Es. 8.5, 9.5, 10.5"
                  />
                  {lineError && (
                    <div className="text-red-500 text-xs mt-1">
                      {lineError}
                    </div>
                  )}
                </div>
                
                {/* Pulsante incremento */}
                <button 
                  onClick={() => adjustLineValue(true)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              {/* Badge di valore */}
              <div className="flex-1">
                {lineValue && !lineError && teamsStats && match?.teams?.home?.id && match?.teams?.away?.id && 
                teamsStats[match.teams.home.id]?.fixturesStats && 
                teamsStats[match.teams.away.id]?.fixturesStats && (
                  mode === 'UO_SQUAD' ? (
                    <ValueBadge 
                      mode={mode}
                      percentage1={(() => {
                        try {
                          const teamToAnalyze = !isReversed ? match.teams.home.id : match.teams.away.id;
                          
                          if (!teamsStats[teamToAnalyze] || !teamsStats[teamToAnalyze].fixturesStats) {
                            return 0;
                          }
                          
                          const fixtures = teamsStats[teamToAnalyze].fixturesStats;
                          
                          const relevantFixtures = fixtures.filter(m => 
                            m && ((!isReversed 
                              ? m.home_team_id === teamToAnalyze
                              : m.away_team_id === teamToAnalyze) && 
                              m.match_statistics)
                          );
                          
                          if (!relevantFixtures.length) return 0;
                          
                          const totalMatches = relevantFixtures.length;
                          const matchesOverLine = relevantFixtures.filter(m => {
                            if (!m.match_statistics) return false;
                            
                            let value = 0;
                            const stats = m.match_statistics;
                            
                            // Per i corner PT
                            if (selectedCategory === 'cornerPT') {
                              value = !isReversed 
                                ? stats.corners_ht_home || 0
                                : stats.corners_ht_away || 0;
                            }
                            // Per i cartellini
                            else if (selectedCategory === 'cartellini') {
                              value = !isReversed
                                ? (stats.yellow_cards_home || 0) + (stats.red_cards_home || 0)
                                : (stats.yellow_cards_away || 0) + (stats.red_cards_away || 0);
                            }
                            // Per tutte le altre statistiche
                            else {
                              const getStatValue = () => {
                                switch(selectedCategory) {
                                  case 'tiri': 
                                    return !isReversed ? stats.shots_home || 0 : stats.shots_away || 0;
                                  case 'tiriPorta': 
                                    return !isReversed ? stats.shots_on_target_home || 0 : stats.shots_on_target_away || 0;
                                  case 'corner': 
                                    return !isReversed ? stats.corners_home || 0 : stats.corners_away || 0;
                                  case 'falli': 
                                    return !isReversed ? stats.fouls_home || 0 : stats.fouls_away || 0;
                                  case 'fuorigioco': 
                                    return !isReversed ? stats.offsides_home || 0 : stats.offsides_away || 0;
                                  case 'parate': 
                                    return !isReversed ? stats.saves_home || 0 : stats.saves_away || 0;
                                  default: 
                                    return 0;
                                }
                              };
                              
                              value = getStatValue();
                            }
                            
                            return value > parseFloat(lineValue);
                          }).length;
                          
                          return (matchesOverLine / totalMatches) * 100;
                        } catch (error) {
                          console.error('Error calculating percentage1 for UO_SQUAD:', error);
                          return 0;
                        }
                      })()}
                      percentage2={(() => {
                        try {
                          const teamToAnalyze = !isReversed ? match.teams.away.id : match.teams.home.id;
                          
                          if (!teamsStats[teamToAnalyze] || !teamsStats[teamToAnalyze].fixturesStats) {
                            return 0;
                          }
                          
                          const fixtures = teamsStats[teamToAnalyze].fixturesStats;
                          
                          const relevantFixtures = fixtures.filter(m => 
                            m && ((!isReversed 
                              ? m.away_team_id === teamToAnalyze
                              : m.home_team_id === teamToAnalyze) &&
                              m.match_statistics)
                          );
                          
                          if (!relevantFixtures.length) return 0;
                          
                          const totalMatches = relevantFixtures.length;
                          const matchesOverLine = relevantFixtures.filter(m => {
                            if (!m.match_statistics) return false;
                            
                            let value = 0;
                            const stats = m.match_statistics;
                            
                            // Per i corner PT
                            if (selectedCategory === 'cornerPT') {
                              value = !isReversed 
                                ? stats.corners_ht_away || 0
                                : stats.corners_ht_home || 0;
                            }
                            // Per i cartellini
                            else if (selectedCategory === 'cartellini') {
                              value = !isReversed
                                ? (stats.yellow_cards_away || 0) + (stats.red_cards_away || 0)
                                : (stats.yellow_cards_home || 0) + (stats.red_cards_home || 0);
                            }
                            // Per tutte le altre statistiche
                            else {
                              const getStatValue = () => {
                                switch(selectedCategory) {
                                  case 'tiri': 
                                    return !isReversed ? stats.shots_away || 0 : stats.shots_home || 0;
                                  case 'tiriPorta': 
                                    return !isReversed ? stats.shots_on_target_away || 0 : stats.shots_on_target_home || 0;
                                  case 'corner': 
                                    return !isReversed ? stats.corners_away || 0 : stats.corners_home || 0;
                                  case 'falli': 
                                    return !isReversed ? stats.fouls_away || 0 : stats.fouls_home || 0;
                                  case 'fuorigioco': 
                                    return !isReversed ? stats.offsides_away || 0 : stats.offsides_home || 0;
                                  case 'parate': 
                                    return !isReversed ? stats.saves_away || 0 : stats.saves_home || 0;
                                  default: 
                                    return 0;
                                }
                              };
                              
                              value = getStatValue();
                            }

                            return value > parseFloat(lineValue);
                          }).length;
                          
                          return (matchesOverLine / totalMatches) * 100;
                        } catch (error) {
                          console.error('Error calculating percentage2 for UO_SQUAD:', error);
                          return 0;
                        }
                      })()}
                    />
                  ) : (
                    // U/O Partita
                    <ValueBadge 
                      mode="UO_MATCH"
                      percentage1={(() => {
                        try {
                          // Analizziamo le partite in casa della squadra di casa
                          if (!match?.teams?.home?.id || !teamsStats[match.teams.home.id]) {
                            return 0;
                          }
                          
                          const homeTeamHomeFixtures = teamsStats[match.teams.home.id].fixturesStats.filter(m => 
                            m && m.home_team_id === match.teams.home.id && m.match_statistics
                          );
                          
                          if (!homeTeamHomeFixtures.length) return 0;
                          
                          const totalHomeMatches = homeTeamHomeFixtures.length;
                          const matchesOverLine = homeTeamHomeFixtures.filter(m => {
                            if (!m.match_statistics) return false;
                            
                            const stats = m.match_statistics;
                            let totalValue = 0;

                            // Per i corner PT
                            if (selectedCategory === 'cornerPT') {
                              totalValue = (stats.corners_ht_home || 0) + (stats.corners_ht_away || 0);
                            }
                            // Per i cartellini
                            else if (selectedCategory === 'cartellini') {
                              totalValue = (stats.yellow_cards_home || 0) + (stats.red_cards_home || 0) +
                                          (stats.yellow_cards_away || 0) + (stats.red_cards_away || 0);
                            }
                            // Per tutte le altre statistiche
                            else {
                              const getStatTotal = () => {
                                switch(selectedCategory) {
                                  case 'tiri': 
                                    return (stats.shots_home || 0) + (stats.shots_away || 0);
                                  case 'tiriPorta': 
                                    return (stats.shots_on_target_home || 0) + (stats.shots_on_target_away || 0);
                                  case 'corner': 
                                    return (stats.corners_home || 0) + (stats.corners_away || 0);
                                  case 'falli': 
                                    return (stats.fouls_home || 0) + (stats.fouls_away || 0);
                                  case 'fuorigioco': 
                                    return (stats.offsides_home || 0) + (stats.offsides_away || 0);
                                  case 'parate': 
                                    return (stats.saves_home || 0) + (stats.saves_away || 0);
                                  default: 
                                    return 0;
                                }
                              };
                              
                              totalValue = getStatTotal();
                            }

                            return totalValue > parseFloat(lineValue);
                          }).length;
                          
                          return (matchesOverLine / totalHomeMatches) * 100;
                        } catch (error) {
                          console.error('Error calculating percentage1 for UO_MATCH:', error);
                          return 0;
                        }
                      })()}
                      percentage2={(() => {
                        try {
                          // Analizziamo le partite in trasferta della squadra in trasferta
                          if (!match?.teams?.away?.id || !teamsStats[match.teams.away.id]) {
                            return 0;
                          }
                          
                          const awayTeamAwayFixtures = teamsStats[match.teams.away.id].fixturesStats.filter(m => 
                            m && m.away_team_id === match.teams.away.id && m.match_statistics
                          );
                          
                          if (!awayTeamAwayFixtures.length) return 0;
                          
                          const totalAwayMatches = awayTeamAwayFixtures.length;
                          const matchesOverLine = awayTeamAwayFixtures.filter(m => {
                            if (!m.match_statistics) return false;
                            
                            const stats = m.match_statistics;
                            let totalValue = 0;

                            // Per i corner PT
                            if (selectedCategory === 'cornerPT') {
                              totalValue = (stats.corners_ht_home || 0) + (stats.corners_ht_away || 0);
                            }
                            // Per i cartellini
                            else if (selectedCategory === 'cartellini') {
                              totalValue = (stats.yellow_cards_home || 0) + (stats.red_cards_home || 0) +
                                          (stats.yellow_cards_away || 0) + (stats.red_cards_away || 0);
                            }
                            // Per tutte le altre statistiche
                            else {
                              const getStatTotal = () => {
                                switch(selectedCategory) {
                                  case 'tiri': 
                                    return (stats.shots_home || 0) + (stats.shots_away || 0);
                                  case 'tiriPorta': 
                                    return (stats.shots_on_target_home || 0) + (stats.shots_on_target_away || 0);
                                  case 'corner': 
                                    return (stats.corners_home || 0) + (stats.corners_away || 0);
                                  case 'falli': 
                                    return (stats.fouls_home || 0) + (stats.fouls_away || 0);
                                  case 'fuorigioco': 
                                    return (stats.offsides_home || 0) + (stats.offsides_away || 0);
                                  case 'parate': 
                                    return (stats.saves_home || 0) + (stats.saves_away || 0);
                                  default: 
                                    return 0;
                                }
                              };
                              
                              totalValue = getStatTotal();
                            }

                            return totalValue > parseFloat(lineValue);
                          }).length;
                          
                          return (matchesOverLine / totalAwayMatches) * 100;
                        } catch (error) {
                          console.error('Error calculating percentage2 for UO_MATCH:', error);
                          return 0;
                        }
                      })()}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        )}
        {/* Visualizzazione delle partite per tutte le modalità */}
        <div className="flex items-start justify-between gap-8 flex-col md:flex-row">
          {teamsStats && match?.teams?.home?.id && teamsStats[match.teams.home.id] && (
            <TeamMatches 
              teamId={match.teams.home.id}
              teamData={teamsStats[match.teams.home.id]}
              isPerforming={mode === 'ONE_X_TWO' ? true : !isReversed}
              mode={mode}
              selectedCategory={selectedCategory}
              lineValue={lineValue}
              isHomeTeamInCurrentMatch={true}
            />
          )}

          {mode === 'UO_SQUAD' && (
            <div className="flex items-center mt-8 gap-8 self-center">
              <div className="flex items-center gap-2">
                <span className="text-3xl">👈</span>
                <span className="font-medium text-gray-900">
                  {!isReversed ? 'Effettuati' : 'Subiti'}
                </span>
              </div>

              <button 
                onClick={handleSwitch}
                className="p-2 rounded-full hover:bg-gray-100 border"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>

              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">
                  {!isReversed ? 'Subiti' : 'Effettuati'}
                </span>
                <span className="text-3xl">👉</span>
              </div>
            </div>
          )}

          {teamsStats && match?.teams?.away?.id && teamsStats[match.teams.away.id] && (
            <TeamMatches 
              teamId={match.teams.away.id}
              teamData={teamsStats[match.teams.away.id]}
              isPerforming={mode === 'ONE_X_TWO' ? true : isReversed}
              mode={mode}
              selectedCategory={selectedCategory}
              lineValue={lineValue}
              isHomeTeamInCurrentMatch={false}
            />
          )}
        </div>
      </div>
      
      {/* Componente di Debug */}
      <DebugInfo 
        autofillDebug={autofillDebug} 
        isVisible={showDebug}
        teamsStats={teamsStats}
        match={match}
      />
    </div>
  );
}