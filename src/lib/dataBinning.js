import { countWords } from '$lib/utils';

function addHeatmapData(binSize, speakers, dataKeys, data) {
  data.forEach(d => {
    const binIndex = Math.floor(d.time / binSize);
    const binStart = binIndex * binSize;
    const binEnd = (binIndex + 1) * binSize;

    if (!speakers[d.speaker]) {
      speakers[d.speaker] = [];
    }

    const speakerBins = speakers[d.speaker];
    let bin = speakerBins.find(b => b.index === binIndex);

    if (!bin) {
      bin = { index: binIndex, start: binStart, end: binEnd };
      speakerBins.push(bin);
    }

    dataKeys.forEach(key => {
      if (!bin[key]) {
        bin[key] = 0;
      }
      if (Math.abs(d[key]) > Math.abs(bin[key])) {
        bin[key] = d[key];
      }
    });
  });

  return speakers;
}

export function binHeatmapData(binSize, voiceMetricsKeys, voiceMetricsData, ecgData) {
  let speakers = {};

  // Add voice metrics (voice_activation, etc.)
  speakers = addHeatmapData(binSize, speakers, voiceMetricsKeys, voiceMetricsData);

  // Add both stress_level (discrete) and stress (continuous)
  speakers = addHeatmapData(binSize, speakers, ['stress_level', 'stress'], ecgData);

  const result = Object.keys(speakers).map(speaker => ({
    speaker: parseInt(speaker),
    bins: speakers[speaker]
  }));

  return result;
}

export function binTranscript(binSize, speakers, data) {
  let maxWordsCount = 0;

  const minStart = data.reduce((min, d) => Math.min(min, d.start), Infinity);
  const maxEnd = data.reduce((max, d) => Math.max(max, d.end), -Infinity);
  const totalDuration = maxEnd - minStart;

  const nBins = Math.ceil(totalDuration / binSize);

  const bins = Array.from({ length: nBins }, (_, i) => {
    const bin = { bin: i };
    speakers.forEach(speaker => bin[speaker] = 0);
    return bin;
  });

  data.forEach(d => {
    const wordCount = countWords(d.text_clean);
    
    const startBin = Math.floor((d.start-minStart) / binSize);
  
    if (bins[startBin]) {
      bins[startBin][d.speaker] += wordCount;
      if (bins[startBin][d.speaker] > maxWordsCount) {
        maxWordsCount = bins[startBin][d.speaker];
      }
    }
  });

  const binnedData = bins.map(bin => {
    const result = { bin: bin.bin * binSize };
    speakers.forEach(speaker => {
      result[speaker] = maxWordsCount > 0 ? Math.round(bin[speaker]/maxWordsCount*100) : 0;
    });
    return result;
  });
  
  return binnedData;
}