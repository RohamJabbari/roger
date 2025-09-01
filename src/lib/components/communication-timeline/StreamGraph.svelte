<script>
  import { speakerColorScale } from "$lib/stores/speaker";
  import { scaleLinear, scaleOrdinal } from 'd3-scale';
  import { extent, max, sum } from 'd3-array';
  import { stack, area, stackOffsetSilhouette, stackOffsetWiggle, stackOrderInsideOut, curveMonotoneX } from 'd3-shape';

  let svg;
  export let totalDuration = 0;
  export let binnedData = [];
  export let speakers = [];
  export let height = 100;
  export let width = 800;
  export let transform = '';

  $: xScale = scaleLinear()
      .domain(extent(binnedData, d => d.bin))
      .range([0, width]);

  $: yScale = scaleLinear()
      .domain([-height/2,height/2])
      .range([height, 0]);
  
  $: stackGenerator = stack()
      // .order(stackOrderInsideOut)
      // .offset(stackOffsetWiggle)
      .offset(stackOffsetSilhouette)
      .keys(speakers);

  $: stackedData = stackGenerator(binnedData);

  $: areaGenerator = area()
      .x(d => xScale(d.data.bin))
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]))
      .curve(curveMonotoneX);
</script>

<g transform={transform}>
  <line class="sg-baseline" x1="0" x2={width} y1={yScale(0)} y2={yScale(0)} />
  {#each stackedData as series, i}
    <path
      d={areaGenerator(series)}
      fill={$speakerColorScale(series.key)}
    />
  {/each}
</g>

<style lang="postcss">
  .sg-baseline {
    stroke: #888;
    stroke-width: 1;
    stroke-dasharray: 2, 3;
  }
</style>