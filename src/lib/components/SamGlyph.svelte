<script>
  import { Dropdown } from "flowbite-svelte";
  import SamGlyphChart from "$lib/components/SamGlyphChart.svelte";
  import {
    filteredData
  } from "$lib/stores/app";

  export let arousal = 3;
  export let valence = 3;
  export let dominance = 3;
  export let size = null;

  function getDominanceSize(value) {
    if (size) return size;
    if (value === 1) {
      return 14;
    } else if (value === 2) {
      return 18;
    } else if (value === 3) {
      return 22;
    } else if (value === 4) {
      return 26;
    } else if (value === 5) {
      return 30;
    }
  }

  function getDominanceOpacity(value) {
    if (value === 1) {
      return 0.2;
    } else if (value === 2) {
      return 0.4;
    } else if (value === 3) {
      return 0.6;
    } else if (value === 4) {
      return 0.8;
    } else if (value === 5) {
      return 1;
    }
  }

  $: dominanceStyle = `width: ${getDominanceSize(dominance)}px; height: ${getDominanceSize(dominance)}px; opacity: ${getDominanceOpacity(dominance)}`;
</script>

<div class="block relative flex-none ml-1" style={dominanceStyle}>
  <img src="img/arousal_{arousal}.png" alt="Sam" class="absolute" style={dominanceStyle} />
  <img src="img/valence_{valence}.png" alt="Sam" class="absolute" style={dominanceStyle} />
</div>
<!-- <Dropdown>
  <div>
    <SamGlyphChart message={$filteredData.transcript[0]} />
  </div>
</Dropdown> -->