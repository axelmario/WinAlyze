// src/components/features/league/components/MatchView.jsx
import { useState } from 'react';
import { CompareComponent } from '@/components/features/compare/CompareComponent';
import { AnalysisComponent } from '@/components/features/analysis/AnalysisComponent';

export function MatchView({ match, matchView, setMatchView, onBack }) {
  return (
    <main className="flex-1 bg-gray-50">
      <div className="h-[calc(100%-88px)]">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 font-medium block"
          >
            ← Torna alla Giornata
          </button>
        </div>

        <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200">
          <button
            onClick={() => setMatchView('confronto')}
            disabled={matchView === 'confronto'}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h2 className="text-xl font-bold text-gray-900">
            {matchView === 'confronto' ? 'Confronto' : 'Analisi'}
          </h2>

          <button
            onClick={() => setMatchView('analisi')}
            disabled={matchView === 'analisi'}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {matchView === 'confronto' ? (
            <CompareComponent match={match} />
          ) : (
            <AnalysisComponent match={match} />
          )}
        </div>
      </div>
    </main>
  );
}