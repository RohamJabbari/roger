import { writable } from 'svelte/store';

export const datasets = writable({});
export const filteredData = writable({});
export const aggregatedData = writable({});
export const aggregatedMotifsData = writable([]);

export const filterTimeRange = writable(null);
export const filterSearchString = writable(null);
export const rogerMode = writable('flow');
export const rogerSpeaker = writable(1);
export const rogerMotifs = writable([]);
export const rogerRecording = writable(50);
export const rogerTime = writable(0);
export const rogerPlaying = writable(false);
export const rogerStress = writable([0,1,2,3]);
export const rogerMotifsCombination = writable('inclusive');
export const rogerMotifsPresentation = writable('filter');
export const tooltip = writable(null);
export const contextPanel = writable({});
export const conversationPosition = writable('right');
export const radarData = writable({})

export const showEmotions = writable(true);

export const heatmapAttributes = writable([
  { key: 'voice_activation', title: 'Activation', category: 'voice' },
  { key: 'voice_dominance', title: 'Dominance', category: 'voice' },
  { key: 'voice_valence', title: 'Valence', category: 'voice' },
  { key: 'voice_speaking_rate', title: 'Speaking Rate', category: 'voice' },
  { key: 'stress_level', title: 'Stress', category: 'ecg' }
]);

export const topics = writable([
  "Navigation",
  "Threats",
  "Coordination",
  "Clearance",
  "Safety"
]);

export const traitKeys =writable(["clarity", "command", "information", "questions", "stress", "speaking_share"]);