import { writable } from 'svelte/store';

export const speakerMap = {
  1: 'Officer A',
  2: 'Officer B',
  3: 'Sergeant'
};

export const speakerColorScale = writable(null);
export const speakerDarkColorScale = writable(null);