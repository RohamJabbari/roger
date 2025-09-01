<script>
  import { scaleLinear, scaleBand } from 'd3-scale';
  import { extent, max } from 'd3-array';

  import Axis from './Axis.svelte';

  export let data;
  export let containerWidth = 200;
  export let xName = '';
  export let yName = '';
  export let xTitle = '';
  export let yTitle = '';

  const containerHeight = 240;
  const margin = { top: 0, right: 20, bottom: 20, left: 140 };
  let svg;

  $: height = containerHeight - margin.top - margin.bottom;
  $: width = containerWidth - margin.left - margin.right;

  $: xScale = scaleLinear()
    .domain([0, max(data, (d) => d[xName])])
    .range([0, width]);
  
  $: yScale = scaleBand()
    .domain(data.map(d => d[yName]))
    .range([0, height])
    .padding(0.1)

</script>

<svg height={containerHeight} width={containerWidth} bind:this={svg}>
  <g transform="translate({margin.left},{margin.top})">
    <Axis
      {width}
      {height}
      scale={yScale}
      tickPadding={12}
      position="left"
      classNames="text-gray-400 text-xs"
    />
    {#each data as d}
      <rect
        x={0}
        y={yScale(d[yName])}
        width={xScale(d[xName])}
        height={yScale.bandwidth()}
        fill="#333"
      />
    {/each}
  </g>
  <!-- {#if yTitle}
    <text  dy="1em" x={margin.left-24} y={10} class="text-sm font-semibold">{yTitle}</text>
  {/if} -->
</svg>