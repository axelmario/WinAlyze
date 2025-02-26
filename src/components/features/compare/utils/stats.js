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
        },
        {
          key: "firstHalfCorners",
          label: "Corner Primo Tempo",
          isNegative: false
        }
      ]
    },
    fouls: {
      expectedLabel: "Falli e Cartellini",
      stats: [
        {
          key: "fouls",
          label: "Falli",
          isNegative: true
        },
        {
          key: "yellowCards",
          label: "Cartellini Gialli",
          isNegative: true
        }
      ]
    },
    misc: {
      expectedLabel: "Altro",
      stats: [
        {
          key: "offsides",
          label: "Fuorigioco",
          isNegative: true
        },
        {
          key: "saves",
          label: "Parate",
          isNegative: false
        }
      ]
    }
  };