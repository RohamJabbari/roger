<script>
  import { select } from "d3-selection";
  import { drag } from 'd3-drag';
  import { rogerTime } from "$lib/stores/app";
  import { secondsToTime } from "$lib/utils";

  export let marginTop = 0;
  export let scrubberLineHeight = 0;
  export let width = 800;
  export let axisScale = null;

  let scrubberG;
  let playheadHeight = 20;
  let isDragging = false;
  
  function dragged(event) {
    let newX = xPos + event.dx;
    if (newX < 0) {
      newX = 0;
    } else if (newX > width) {
      newX = width;
    }

    xPos = newX;

    const selectedTime = Math.round(axisScale.invert(xPos));
    if (selectedTime != $rogerTime) {
      $rogerTime = selectedTime;
    }
  }

  $: xPos = $rogerTime ? axisScale($rogerTime) : 0;

  const dragHandler = drag()
    .on('drag', (event) => dragged(event))
    .on('start', () => isDragging = true)
    .on('end', () => isDragging = false);

  $: {
    select(scrubberG).call(dragHandler);
  }

</script>

<g bind:this={scrubberG} class="scrubber {isDragging ? 'dragging' : ''}" transform="translate({xPos},{marginTop})">
  <line class="scrubber-line" x1="0" x2={0} y1={playheadHeight} y2={scrubberLineHeight} />
  <path class="scrubber-playhead" transform="translate(-6.5, 2)" d="M 0 3.33 Q 0 0 3.33 0 L 10 0 Q 13.33 0 13.33 3.33 L 13.33 13.33 L 6.67 20 L 0 13.33 L 0 3.33" fill="#000" />
  <g class="scrubber-tooltip" transform="translate(0,{-2})">
    <rect x="-18" y="-16" width="36" height="18" rx="4" ry="4" fill="#000" fill-opacity="0.8" />
    <text class="text-xs" x="0" dy="0.35em" y="-9" fill="#fff" text-anchor="middle" alignment-baseline="middle">{secondsToTime($rogerTime)}</text>
  </g>
</g>

<style lang="postcss">
  .scrubber-line {
    stroke: #bbb;
    stroke-dasharray: 1 1;
  }
  .scrubber-playhead {
    fill: #fff;
    fill-opacity: 0.8;
    stroke: #bbb;
    cursor: ew-resize;
    filter: drop-shadow(1px 1px 1px rgb(0 0 0 / 0.2));
  }
  .scrubber-playhead:hover {
    stroke: #969595;
  }
  .scrubber-tooltip {
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
  }
  .scrubber.dragging .scrubber-tooltip, .scrubber:hover .scrubber-tooltip {
    opacity: 1;
  }
</style>