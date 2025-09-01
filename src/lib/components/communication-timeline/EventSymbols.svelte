<script>
  import { tooltip, rogerTime } from "$lib/stores/app";
  import { createEventDispatcher } from "svelte";

  export let timelineScale;
  export let yOffset = 0;
  export let events;

  const dispatch = createEventDispatcher();

  function handleContextMenu(event, milestone) {
    event.preventDefault(); // prevent browser menu
    dispatch("contextmenu", {
      event: milestone,
      clientX: event.clientX,
      clientY: event.clientY
    });
  }
</script>

{#if events && events.length > 0}
  <g transform={`translate(0, ${yOffset})`}>
    {#each events as milestone}
      <polygon
              points="0,-8 8,0 0,8 -8,0"
              fill={milestone.color || "gray"}
              class="opacity-70 hover:opacity-100"
              transform={`translate(${timelineScale(milestone.time)}, 0)`}
              on:mouseover={(event) => {
          $tooltip = {
            x: event.clientX + 4,
            y: event.clientY + 4,
            content: `${milestone.description}<span style="opacity:0.7;"> (${milestone.time}s)</span>`
          };
        }}
              on:mouseleave={() => {
          $tooltip = null;
        }}
              on:click|stopPropagation={() => {
          $rogerTime = milestone.time;
        }}
              on:contextmenu={(e) => handleContextMenu(e, milestone)}
      />
    {/each}
  </g>
{/if}