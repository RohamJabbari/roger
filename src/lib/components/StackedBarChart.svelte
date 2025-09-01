<script>
  import { scaleLinear, scaleBand } from "d3-scale";
  import { extent, max } from "d3-array";
  import { stack } from "d3-shape";
  import { contextPanel, filteredData } from '$lib/stores/app';

  import Axis from "./Axis.svelte";

  export let data = [];
  export let containerWidth = 400;
  export let segments = [];
  export let colorScale;

  const containerHeight = 200;
  export let margin = { top: 0, right: 20, bottom: 20, left: 120 };
  let svg;

  $: height = containerHeight - margin.top - margin.bottom;
  $: width = containerWidth - margin.left - margin.right;

  $: xScale = scaleLinear().domain([0, 100]).range([0, width]);

  $: yScale = scaleBand()
    .domain(data.map((d) => d.dimension))
    .range([0, height])
    .padding(0.1);

  $: stackedData = stack()
    .keys(segments)
    .value((d, key) => d[key])(data);

  // $: console.log('data', data);
  // $: console.log('segments', segments);
  // $: console.log('stackedData', stackedData);

  function filterTranscriptBySpeakerDimension(speaker, dimensionKey) {
    let transcript = [];
    if (dimensionKey && dimensionKey !== 'speakingShare') {
      transcript = $filteredData.transcript.filter((t) => t.speaker === speaker && t[dimensionKey] == true);
    } else {
      transcript = $filteredData.transcript.filter((t) => t.speaker === speaker);
    }
    // console.log('transcript', transcript);
    return transcript;
  }
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
    {#each stackedData as stack}
      {#each stack as d}
        {#if d.data[stack.key] > 0}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <!-- svelte-ignore a11y-mouse-events-have-key-events -->
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <rect
            x={xScale(d[0])}
            y={yScale(d.data.dimension)}
            width={xScale(d[1]) - xScale(d[0])}
            height={yScale.bandwidth()}
            data-test={d.key}
            fill={stack.key === "other" ? "#ddd" : colorScale(stack.key)}
            on:mousemove={(event) => {
              if ($contextPanel?.open) return;
              $contextPanel = {
                x: event.clientX,
                y: event.clientY
              };
            }}
            on:mouseleave={() => {
              if ($contextPanel?.open) return;
              $contextPanel = null;
            }}
            on:click={(event) => {
              // console.log('event', event);
              if ($contextPanel?.open) {
                $contextPanel = null;
              } else {
                if (!$contextPanel) {
                  $contextPanel = {
                    x: event.clientX,
                    y: event.clientY
                  };
                }
                $contextPanel.open = true;
                $contextPanel.transcript = $filteredData.transcript.filter((t) => t.speaker == 3 && t.stress_level == 1);
                // console.log('transcript', $filteredData.transcript);
                // console.log('contextPanel', $contextPanel.transcript);
                // $contextPanel.transcript = filterTranscriptBySpeakerDimension(stack.key, d.data.dimensionKey);
              }
              // $contextPanel = $contextPanel ? { ...$contextPanel, open: !$contextPanel.open } : { open: true };
            }}
          />
          <text
            text-anchor="middle"
            x={xScale(d[0]) + (xScale(d[1]) - xScale(d[0]))/2}
            y={yScale(d.data.dimension) + yScale.bandwidth() / 2}
            dy=".35em"
            class="text-xs pointer-events-none font-semibold select-none">{Math.round(d.data[stack.key])}%</text
          >
        {/if}
      {/each}
    {/each}
  </g>
</svg>

<style lang="postcss">
  rect {
    shape-rendering: crispEdges;
  }
</style>
