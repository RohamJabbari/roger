<script>
  import { speakerColorScale, speakerMap } from "$lib/stores/speaker";
  export let speakers = [];
  export let allSpeakers = [];
</script>

<div class="flex gap-3 items-center group">
  <div class="font-medium text-sm select-none">Participants</div>
  <div class="flex items-center space-x-1 transition-all">
    {#each allSpeakers as speaker}
      <button
        on:click={() => {
          if (speakers.includes(speaker)) {
            speakers = speakers.filter((s) => s !== speaker);
          } else {
            speakers = [...speakers, speaker];
          }
        }}
        class="relative hover:opacity-80 rounded-full ring-2 ring-[#f5f2ed] flex-none font-semibold leading-4 text-sm w-20 h-6 text-center text-white"
        style="background: {$speakerColorScale && speakers.includes(speaker) ? $speakerColorScale(speaker) : '#ddd'}"
      >
        {#if speakers.includes(speaker)}
          {speakerMap[speaker] || speaker}
        {:else}
          <div class="absolute top-0 left-1 w-full h-6 strikethrough text-[#f5f2ed]"></div>
          <div class="absolute top-0.5 w-full h-6 text-center text-gray-400">{speakerMap[speaker] || speaker}</div>
        {/if}
      </button>
    {/each}
  </div>
</div>

<style>
  .strikethrough {
    background: linear-gradient(to left top, transparent 47.75%, currentColor 49.5%, currentColor 50.5%, transparent 52.25%);
  }
</style>