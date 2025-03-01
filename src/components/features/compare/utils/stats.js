// src/components/features/compare/utils/stats.js
export const STATS_CATEGORIES = {
  shots: {
    expectedLabel: "Tiri",
    stats: [
      {
        key: "shots",
        label: "Tiri Totali",
        isNegative: false
      },
      {
        key: "shotsOnTarget",
        label: "Tiri in Porta",
        isNegative: false
      }
    ]
  },
  corners: {
    expectedLabel: "Calci d'Angolo",
    stats: [
      {
        key: "corners",
        label: "Corner Totali",
        isNegative: false
      }
    ]
  },
  firstHalfCorners: {
    expectedLabel: "Corner Primo Tempo",
    stats: [
      {
        key: "firstHalfCorners",
        label: "Corner Primo Tempo",
        isNegative: false
      }
    ]
  },
  fouls: {
    expectedLabel: "Falli",
    stats: [
      {
        key: "fouls",
        label: "Falli",
        isNegative: true
      }
    ]
  },
  yellowCards: {
    expectedLabel: "Cartellini Gialli",
    stats: [
      {
        key: "yellowCards",
        label: "Cartellini Gialli",
        isNegative: true
      }
    ]
  },
  redCards: {
    expectedLabel: "Cartellini Rossi",
    stats: [
      {
        key: "redCards",
        label: "Cartellini Rossi",
        isNegative: true
      }
    ]
  },
  offsides: {
    expectedLabel: "Fuorigioco",
    stats: [
      {
        key: "offsides",
        label: "Fuorigioco",
        isNegative: true
      }
    ]
  },
  saves: {
    expectedLabel: "Parate",
    stats: [
      {
        key: "saves",
        label: "Parate",
        isNegative: false
      }
    ]
  }
};