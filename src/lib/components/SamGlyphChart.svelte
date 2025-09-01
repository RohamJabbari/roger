<script>
  import SamGlyph from './SamGlyph.svelte';
  import { scaleLinear } from 'd3-scale';

  let containerHeight = 280;
  let containerWidth = 360;
  let svg;

  export let margin = { top: 0, right: 0, bottom: 0, left: 0 };
  
  $: height = containerHeight - margin.top - margin.bottom;
  $: width = containerWidth - margin.left - margin.right;

  export let message;

  $: xScale = scaleLinear()
    .domain([-1, 1])
    .range([0, width]);
  
  $: yScale = scaleLinear()
    .domain([-1, 1])
    .range([0, height]);
  
  function getDominanceOffset(value) {
    if (value === 1) {
      return 7;
    } else if (value === 2) {
      return 9;
    } else if (value === 3) {
      return 11;
    } else if (value === 4) {
      return 13;
    } else if (value === 5) {
      return 15;
    }
  }
</script>

<div class="relative">
  <svg class="absolute" height={containerHeight} width={containerWidth} bind:this={svg}>
    <g transform="translate({margin.left},{margin.top})">
      <line
        x1="0"
        y1={height / 2}
        x2={width}
        y2={height / 2}
        stroke="#ddd"
        stroke-width="2"
      />
      <line
        y1="0"
        x1={width / 2}
        y2={height}
        x2={width / 2}
        stroke="#ddd"
        stroke-width="2"
      />
      <text
        x={width / 2}
        y={0}
        dy="0.8em"
        class="font-semibold select-none"
        font-size="12"
        fill="#888"
        text-anchor="middle"
      >Pleasant</text>
      <text
        x={width / 2}
        y={height - 20}
        dy="0.7em"
        class="font-semibold select-none"
        font-size="12"
        fill="#888"
        text-anchor="middle"
      >Unpleasant</text>
      <text
        x={0}
        y={height/2}
        dy="-0.3em"
        class="font-semibold select-none"
        font-size="12"
        fill="#888"
        text-anchor="start"
      >Calm</text>
      <text
        x={width}
        y={height/2}
        dy="-0.3em"
        class="font-semibold select-none"
        font-size="12"
        fill="#888"
        text-anchor="end"
      >Excited</text>
    </g>
  </svg>
  {#if message}
    <div class="absolute" style={`left: ${xScale(message.arousal)-getDominanceOffset(message.arousal_level)}px; top:${yScale(message.valence)-getDominanceOffset(message.valence_level)}px;`}>
      <SamGlyph 
        arousal={message.arousal_level}
        valence={message.valence_level}
        dominance={message.dominance_level}
      />
    </div>
  {/if}
</div>
