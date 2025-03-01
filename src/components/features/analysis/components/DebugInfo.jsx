// src/components/features/analysis/components/DebugInfo.jsx
'use client';

export default function DebugInfo({ autofillDebug, isVisible = false, teamsStats, match }) {
  if (!isVisible) return null;
  
  // Estrai alcuni dati di esempio
  let homeTeamId = match?.teams?.home?.id;
  let awayTeamId = match?.teams?.away?.id;
  let homeFixturesCount = 0;
  let awayFixturesCount = 0;
  let sampleFixtures = [];
  
  if (teamsStats && homeTeamId && teamsStats[homeTeamId]?.fixturesStats) {
    homeFixturesCount = teamsStats[homeTeamId].fixturesStats.length;
    sampleFixtures = teamsStats[homeTeamId].fixturesStats.slice(0, 2);
  }
  
  if (teamsStats && awayTeamId && teamsStats[awayTeamId]?.fixturesStats) {
    awayFixturesCount = teamsStats[awayTeamId].fixturesStats.length;
  }
  
  return (
    <div className="bg-gray-100 p-4 rounded-lg mt-4 text-xs overflow-x-auto">
      <h3 className="font-bold mb-2">Debug Info</h3>
      
      <div className="mb-4">
        <h4 className="font-semibold">Teams Info:</h4>
        <div>Home Team ID: {homeTeamId || 'N/A'}</div>
        <div>Away Team ID: {awayTeamId || 'N/A'}</div>
        <div>Home Team Fixtures Count: {homeFixturesCount}</div>
        <div>Away Team Fixtures Count: {awayFixturesCount}</div>
      </div>
      
      <div className="mb-4">
        <h4 className="font-semibold">Teams Stats Keys:</h4>
        {teamsStats ? (
          <div>
            {Object.keys(teamsStats).map(key => (
              <div key={key}>
                Team ID: {key}, 
                Has Team Data: {teamsStats[key].team ? 'Yes' : 'No'},
                Team Name: {teamsStats[key].team?.name || 'Unknown'},
                Has fixturesStats: {teamsStats[key].fixturesStats ? 'Yes' : 'No'},
                Fixtures Count: {teamsStats[key].fixturesStats?.length || 0}
              </div>
            ))}
          </div>
        ) : (
          <div>No teamsStats available</div>
        )}
      </div>
      
      {sampleFixtures.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold">Sample Fixtures (first {sampleFixtures.length}):</h4>
          {sampleFixtures.map((fixture, index) => (
            <div key={index} className="mb-2 border-b pb-2">
              <div>ID: {fixture.id}</div>
              <div>Date: {fixture.date}</div>
              <div>Status: {fixture.status || 'N/D'}</div>
              <div>Home Team ID: {fixture.home_team_id} / Away Team ID: {fixture.away_team_id}</div>
              <div>Score: {fixture.score_home !== undefined ? fixture.score_home : 'N/D'} - {fixture.score_away !== undefined ? fixture.score_away : 'N/D'}</div>
              <div>Has match_statistics: {fixture.match_statistics ? 'Yes' : 'No'}</div>
            </div>
          ))}
        </div>
      )}
      
      <button 
        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
        onClick={() => {
          console.log("FULL DEBUG:", {
            match,
            teamsStats,
            homeTeamId,
            awayTeamId,
            homeTeam: homeTeamId ? teamsStats[homeTeamId] : null,
            awayTeam: awayTeamId ? teamsStats[awayTeamId] : null,
            homeFixtures: homeTeamId && teamsStats[homeTeamId] ? teamsStats[homeTeamId].fixturesStats : null,
            awayFixtures: awayTeamId && teamsStats[awayTeamId] ? teamsStats[awayTeamId].fixturesStats : null
          });
        }}
      >
        Log Full Debug nella Console
      </button>
    </div>
  );
}