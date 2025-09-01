<script>
  import { scaleLinear } from "d3-scale";
  import { select } from "d3-selection";
  import { brushX } from "d3-brush";
  import { axisTop } from "d3-axis";
  import { format } from "d3-format";
  import { filterTimeRange, rogerTime, rogerMode } from "$lib/stores/app";
  import Scrubber from "./Scrubber.svelte";

  let svg, axisG, brushG, brush;
  export let brushHeight = 20;
  export let brushAxisGap = 30;

  export let totalDuration = 0;
  export let width = 800;
  export let height = 200;
  export let axisScale;

  $: brushScale = scaleLinear().domain([0, totalDuration]).range([0, width]);
  $: axisScale = $filterTimeRange ? scaleLinear().domain($filterTimeRange).range([0, width]) : brushScale;

  $: {
    select(axisG).selectAll("*").remove();

    let axis = axisTop(axisScale); //.tickSizeOuter(0);
    // transform = `translate(0, ${yPos})`;
    // axis.tickSize(tickSize);
    // axis.tickPadding(tickPadding);

    axis.tickFormat((d => {
      const minutes = Math.floor(d / 60);
      const seconds = d % 60;
      return format("02")(minutes) + ":" + format("02")(seconds);
    }));
    // axis.ticks(6);

    select(axisG).call(axis);
    select(axisG).call(g => g.select(".domain").remove())
  }
  
  $: {
    brush = brushX()
      .extent([
        [0, 0],
        [width, brushHeight],
      ])
      .on("end", onBrushEnd);
    brush.handleSize(3);
    // if ($rogerMode == 'content') {
    //   select(brushG).call(brush).call(brush.move, getDefaultBrushExtent());
    // } else {
      
    // }
    select(brushG).call(brush).call(brush.move, [0, width]);
  }

  function resetBrushSelection() {
    $filterTimeRange = null;
    $rogerTime = 0;
    select(brushG).call(brush.move, getDefaultBrushExtent());
  }

  function getDefaultBrushExtent() {
    // if ($rogerMode == 'content') {
    //   return [0, Math.min(width, brushScale(180))];
    // } else {
      return [0, width];
    // }
  }

  function revertBrushToLast() {
    const extent = $filterTimeRange
            ? $filterTimeRange.map(brushScale)
            : getDefaultBrushExtent();

    select(brushG).transition().duration(100).call(brush.move, extent);
  }

  function onBrushEnd({ selection }) {
    if (selection) {
      const selectedRange = selection.map(brushScale.invert).map(Math.round);

      // Don't set invalid or same range (can cause D3 to glitch)
      if (selectedRange[0] !== selectedRange[1]) {
        $filterTimeRange = selectedRange;
        $rogerTime = selectedRange[0];
      } else {
        // Prevent 0-length brush
        revertBrushToLast();
      }
    } else {
      // Null selection (e.g. empty click) — restore previous brush
      revertBrushToLast();
    }
  }
</script>

<g on:dblclick={resetBrushSelection}>

  <g class="brush" bind:this={brushG}
      on:click|stopPropagation
      on:mousedown|stopPropagation
      on:mouseup|stopPropagation
      on:mousemove|stopPropagation>>
    <rect width={width} height={brushHeight} fill="#f1f1f1" />
  </g>
</g>
<g class="select-none" bind:this={axisG} transform={`translate(0, ${brushHeight+brushAxisGap})`}></g>
<Scrubber {axisScale} {width} scrubberLineHeight={height-brushHeight} marginTop={brushHeight+2} />

<style lang="postcss">
  :global(.brush .handle) {
    fill: #777;
    stroke: #777;
  }
  :global(.brush .selection) {
    stroke: none;
  }
  :global(.tick line) {
      shape-rendering: crispedges;
      stroke-width: 1px;
      stroke: #ccc;
  }
  :global(.tick text) {
      font-size: 0.7rem;
      fill: #777
  }
  :global(.overlay) {
    fill: #ece7df;
  }
</style>