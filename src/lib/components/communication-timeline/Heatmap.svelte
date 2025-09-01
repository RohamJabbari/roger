<script>
  import { speakerColorScale } from "$lib/stores/speaker";
  import { scaleLinear, scaleBand } from 'd3-scale';
  import { min, max } from 'd3-array';
  import { filterTimeRange, heatmapAttributes } from "$lib/stores/app";
  import { tooltip } from '$lib/stores/app';
  import { secondsToTime } from '$lib/utils';

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
  
  $: yScaleSpeakers = scaleBand()
      .domain(speakers.sort((a, b) => a - b))
      .range([0, height])
      .padding(0.15);
  
  $: yScaleAttributes = scaleBand()
      .domain($heatmapAttributes.map(attr => attr.key))
      .range([0, yScaleSpeakers.bandwidth()])
      .padding(0);
</script>

<g id="heatmap" transform={transform}>
  {#each data as speakerObj}
    <g transform={`translate(0, ${yScaleSpeakers(speakerObj.speaker)})`}>
      <rect x={0} y={0} width={width} height={yScaleSpeakers.bandwidth()} fill="white" rx="3" class="crisp stroke-slate-200" />
      <rect x={-14} y={0} width={8} rx="4" height={yScaleSpeakers.bandwidth()} fill={$speakerColorScale(speakerObj.speaker)} />
      <text class="fill-white font-bold" x={-14} y={yScaleSpeakers.bandwidth() / 2} dy="0.35em" text-anchor="center" font-size="0.75em">{speakerObj.speaker}</text>
      <clipPath id="heatmap-clip-{speakerObj.speaker}">
        <rect x={0} y={0} rx="3" width={width} height={yScaleSpeakers.bandwidth()} />
      </clipPath>

      {#each $heatmapAttributes as attr}
        <g transform={`translate(0, ${yScaleAttributes(attr.key)})`}>
          {#each speakerObj.bins as d}
            {#if d[attr.key] !== undefined}
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <!-- svelte-ignore a11y-mouse-events-have-key-events -->
              <rect
                class="crisp"
                x={xScale(d.start)}
                width={xScale(d.end) - xScale(d.start)}
                height={yScaleAttributes.bandwidth()}
                fill={attr.scale(d[attr.key])}
                clip-path="url(#heatmap-clip-{speakerObj.speaker})"
                on:mouseover={(event) => {
                  $tooltip = {
                    x: event.clientX,
                    y: event.clientY,
                    content: `${secondsToTime(d.start)} - ${secondsToTime(d.end)}`,
                  };
                }}
                on:mouseleave={() => {
                  $tooltip = null;
                }}
              />
            {/if}
          {/each}

          <text class="" x={2} y={yScaleAttributes.bandwidth() / 2} dy="0.35em" text-anchor="start" font-size="0.65em">{attr.title}</text>
        </g>
      {/each}
    </g>
  {/each}
</g>

<style lang="postcss">
  #heatmap .crisp {
    shape-rendering: crispEdges;
  }
</style>