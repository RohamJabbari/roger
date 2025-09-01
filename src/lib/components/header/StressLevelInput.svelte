<script>
  import { rogerStress } from '$lib/stores/app';
  import { stressLevels, stressLevelColorScale } from "$lib/utils";
  import StressLevelLegend from './StressLevelLegend.svelte';

  export let showStress = true;
</script>
<button on:click={() => showStress = !showStress } class="flex gap-2 px-3 items-center group rounded-full hover:bg-[#ece7df] {showStress ? 'opacity-100' : 'opacity-40'}">
  <div class="font-medium text-sm select-none">Stress</div>
  <StressLevelLegend />
</button>
<!-- <div class="flex gap-3 items-center group">
  <div class="font-medium text-sm select-none">Stress</div>
  <div class="flex gap-1 items-center">
    {#each stressLevels as stressLevel}
      <button
        class="rounded-full w-{stressLevel.size} h-{stressLevel.size}"
        on:click={() => {
          if ($rogerStress.includes(stressLevel.value)) {
            $rogerStress = $rogerStress.filter((d) => d !== stressLevel.value);
          } else {
            $rogerStress = [...$rogerStress, stressLevel.value];
          }
        }}
      >
        <img
          class="{$rogerStress.includes(stressLevel.value) ? 'opacity-60' : 'opacity-20'} hover:opacity-90"
          src="/img/stress{stressLevel.value}.svg"
          alt="Stress level {stressLevel.value}"
        />
      </button>
    {/each}
  </div>
</div> -->