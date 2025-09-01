<script>
  import { stressLevelColorScale } from "$lib/utils";
  import { scaleLinear, scaleBand } from 'd3-scale';
  import { min, max } from 'd3-array';
  import { filterTimeRange } from "$lib/stores/app";

  let svg;

  export let data = [];
  export let totalDuration = 0;
  export let speakers = [];
  export let height = 200;
  export let width = 800;
  export let transform = '';

  $: xScale = scaleLinear()
      .domain($filterTimeRange ? $filterTimeRange : [0, totalDuration])
      .range([0, width]);
  
  $: yScale = scaleBand()
      .domain(speakers.sort((a, b) => a - b))
      .range([0, height])
      .padding(0.1);
</script>

<g transform={transform}>
  {#each data as speakerObj}
    <g transform={`translate(0, ${yScale(speakerObj.speaker)})`}>
      <text class="fill-gray-700" x={-5} y={yScale.bandwidth() / 2} dy="0.35em" text-anchor="end" font-size="0.75em">{speakerObj.speaker}</text>
      {#each speakerObj.bins as d}
        <rect
          x={xScale(d.start)}
          width={xScale(d.end) - xScale(d.start)}
          height={yScale.bandwidth()}
          fill={stressLevelColorScale(d.stress_level)}
        />
      {/each}
    </g>
  {/each}
</g>

<style lang="postcss">
  rect {
    /* shape-rendering: crispEdges; */
  }
</style>