<script>
  import { scaleLinear, scaleSequential } from 'd3-scale';
  import { interpolateGreys } from 'd3-scale-chromatic'; // or any other interpolator you prefer

  export let data = [];
  export let transform = '';
  export let laneGap = 30;
  export let laneHeight = 60;
  export let timelineScale;

  let gradientStopsScale;
  let gradientColorScale;

  let mergedBins = [];

  // 🔁 Merge bins with same stress *value* range (rounded if needed)
  $: if (data.length > 0) {
    mergedBins = [];
    data.forEach(lane => {
      const bins = [];
      let currBin;
      lane.bins.forEach((bin, index) => {
        if (index === 0) {
          currBin = { ...bin };
        } else {
          // Merge adjacent bins with approximately equal stress
          if (Math.abs((bin.stress ?? 0) - (currBin.stress ?? 0)) < 0.01) {
            currBin.end = bin.end;
          } else {
            bins.push(currBin);
            currBin = { ...bin };
          }
        }
      });
      bins.push(currBin);
      mergedBins.push({ speaker: lane.speaker, bins });
    });
  }

  $: if (timelineScale)
    gradientStopsScale = scaleLinear()
            .domain(timelineScale.domain())
            .range([0, 100]);

  // 🎨 Continuous stress-based color scale (e.g., light to dark)
  $: gradientColorScale = scaleSequential(interpolateGreys)
          .domain([0, 1]); // adjust domain based on your expected stress range
</script>

<g transform={transform}>
  <defs>
    {#each mergedBins as lane (lane.speaker)}
      <linearGradient id="gradient-{lane.speaker}" x1="0" x2="1" y1="0" y2="0">
        {#each lane.bins as bin}
          <stop
                  data-time={bin.start}
                  offset={gradientStopsScale(bin.start) + "%"}
                  stop-color={gradientColorScale(bin.stress ?? 0)}
          />
        {/each}
      </linearGradient>
    {/each}
  </defs>

  {#each mergedBins as lane, i (lane.speaker)}
    <rect
            x="0"
            y={i * (laneHeight + laneGap)}
            width={timelineScale.range()[1]}
            height={laneHeight}
            fill="url(#gradient-{lane.speaker})"
    />
  {/each}
</g>