import { cleanText, timeToSeconds } from '$lib/utils';

// Speaker role mapping
import { speakerMap } from "$lib/stores/speaker";

// Topic list for mappings
export const topicList = ['Navigation', 'Threats', 'Coordination', 'Clearance', 'Safety'];

function getStressLevel(stress) {
  if (stress <= 0.2) return 0;
  if (stress <= 0.4) return 1;
  if (stress <= 0.6) return 2;
  return 3;
}

function getEmotionLevel(value) {
  if (value <= -0.6) return 1;
  if (value <= -0.2) return 2;
  if (value <= 0.2) return 3;
  if (value <= 0.6) return 4;
  return 5;
}

export function preprocessECG(data) {
  return data.map(d => {
    return {
      speaker: parseInt(d.speaker),
      time: d.time,
      stress: d.stress,
      stress_level: getStressLevel(d.stress)
    };
  });
}

export function preprocessVoiceMetrics(data) {
  data.map(d => {
    d.time = d.timestamp/1000;
    return d;
  });
  return data;
}

export function preprocessTranscript(data) {
  const totalDuration = timeToSeconds(data[data.length - 1].end);
  const speakers = [...new Set(data.map(d => d.speaker))].sort((a, b) => a - b);

  // const speakers = [...new Set(data.map(d => speakerMap[d.speaker] || d.speaker))];

  data.forEach(d => {
    d.start = timeToSeconds(d.start);
    d.end = timeToSeconds(d.end);
    d.duration = Math.round((d.end - d.start) * 100) / 100;
    d.text_clean = cleanText(d.text);
    d.text_level1 = d.text_level1;
    d.text_level2 = d.text_level2;
    d.stress = d.stress;
    d.stress_level = getStressLevel(d.stress);
    d.arousal = d.arousal;
    d.arousal_level = getEmotionLevel(d.arousal);
    d.valence = d.valence;
    d.valence_level = getEmotionLevel(d.valence);
    d.dominance = d.dominance;
    d.dominance_level = getEmotionLevel(d.dominance);
    d.nameTag = speakerMap[d.speaker] || d.speaker;  // Replace with mapped label

    // 🟡 Add topic memberships
    d.topicMemberships = {};
    topicList.forEach(topic => {
      d.topicMemberships[topic] = parseFloat(d[topic]) || 0;
    });
  });

  return { totalDuration, speakers, data };
}

export function aggregateStressData(ecgData) {
  const aggregatedData = [];

  // Group data by speaker
  const groupedBySpeaker = ecgData.reduce((acc, { speaker, stress_level }) => {
    if (!acc[speaker]) acc[speaker] = { 0: 0, 1: 0, 2: 0, 3: 0, total: 0 };
    acc[speaker][stress_level]++;
    acc[speaker].total++;
    return acc;
  }, {});

  // Calculate relative values and format the result
  for (const [speaker, counts] of Object.entries(groupedBySpeaker)) {
    const relativeValues = {
      0: (counts[0] / counts.total) * 100,
      1: (counts[1] / counts.total) * 100,
      2: (counts[2] / counts.total) * 100,
      3: (counts[3] / counts.total) * 100,
      dimension: speaker,
    };
    aggregatedData.push(relativeValues);
  }

  return aggregatedData;
}