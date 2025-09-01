import { scaleOrdinal } from 'd3-scale';
import { format } from "d3-format";

export function cleanText(text) {
  return text.replace(/\(.*?\)|[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
}

export function countWords(text) {
  return text.split(/\s+/).length;
}

export function timeToSeconds(time) {
  const [hours, minutes, seconds, frames] = time.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds + frames / 100;
}

export function secondsToTime(totalSeconds) {
  totalSeconds = Math.round(totalSeconds);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return format("02")(minutes) + ":" + format("02")(seconds);
}

export function getRandomId() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;

  for (let i = 0; i < 10; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

// export const stressLevelColorScale = scaleOrdinal()
//   .range(['#f1f3f5','#DEE2E6','#ADB5BD','#6C757D'])
//   .domain([0, 1, 2, 3]);
export const stressLevelColorScale = scaleOrdinal()
  .range(["#f5f2ed", "#DAD7D2", "#B5AFA6", "#989186"])
  .domain([0, 1, 2, 3]);

export const stressLevelColorScalePub = scaleOrdinal()
  .range(["#edebe8", "#DAD7D2", "#B5AFA6", "#989186"])
  // .range(['#B1D9A5','#FBE093','#F88062','#E74358'])
  .domain([0, 1, 2, 3]);

export const stressLevels = [
  { value: 0, size: 2 },
  { value: 1, size: 3 },
  { value: 2, size: 4 },
  { value: 3, size: 5 },
];