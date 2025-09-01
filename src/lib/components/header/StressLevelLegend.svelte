<script>
  import { stressLevelColorScale } from "$lib/utils";

  export let height = 12;
  export let width = 64;
</script>

<svg height={height} width={width}>
  <defs>
    <linearGradient id="stress-legend-gradient" x1="0" x2="1" y1="0" y2="0">
      {#each [0,1,2,3] as stressLevel}
        <stop
          offset={stressLevel * 0.25 * 100 + "%"}
          stop-color={stressLevelColorScale(stressLevel)}
        />
      {/each}
    </linearGradient>
  </defs>
  <rect
    x="0"
    y="0"
    {width}
    {height}
    fill="url(#stress-legend-gradient)"
  />
</svg>