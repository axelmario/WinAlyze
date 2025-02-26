// src/pages/index.js
import { LeagueSelector } from '@/components/features/leagues/LeagueSelector';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">WinAlyze</h1>
          <p className="text-gray-600">Analisi delle partite di calcio</p>
        </div>
      </header>
      
      <main>
        <LeagueSelector />
      </main>
      
      <footer className="bg-white border-t mt-12 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500">
          &copy; {new Date().getFullYear()} WinAlyze - Tutti i diritti riservati
        </div>
      </footer>
    </div>
  );
}