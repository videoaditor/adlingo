// Airtable configuration
// In production, these should be environment variables
const AIRTABLE_CONFIG = {
  apiKey: import.meta.env.VITE_AIRTABLE_API_KEY || '',
  baseId: 'appP65kN7D9LjbXb0',
  tables: {
    players: 'Players',
    training: 'Training',
  },
  fields: {
    playerName: 'Name',
    playerEmail: 'Email',
    playerRank: 'Rank',
    playerTrustScore: 'Trust Score',
    playerGold: 'Gold',
    playerNotes: 'Notes',
    playerProgress: 'AdLingo Progress',
  },
};

export default AIRTABLE_CONFIG;
