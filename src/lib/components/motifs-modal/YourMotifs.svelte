<script>
  import { rogerMotifs, rogerMotifsCombination, rogerMotifsPresentation } from "$lib/stores/app";
  import RogerIcon from "$lib/components/RogerIcon.svelte";
  import Select from "$lib/components/Select.svelte";

  $: console.log('rogerMotifsPresentation', $rogerMotifsPresentation);
</script>

<div class="justify-between flex items-center mt-3 mb-3">
  <div class="flex space-x-7 items-center">
    <div class="flex items-center space-x-2 ">
      <div class="text-gray-700 font-normal text-sm">Presentation:</div>
      <Select bind:value={$rogerMotifsPresentation}>
        <option value="filter">Filter</option>
        <option value="highlight">Highlight</option>
      </Select>
    </div>
    {#if $rogerMotifs.length > 1}
      <div class="flex items-center space-x-3 text-sm">
        <div class="text-gray-700 font-normal">Combination:</div>
        <div class="flex space-x-4 font-semibold">
          <div class="flex items-center">
            <input value="inclusive" bind:group={$rogerMotifsCombination} id="combined-motifs-inclusive" name="combined-motifs" type="radio" class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600">
            <label for="combined-motifs-inclusive" class="ml-1.5 block leading-6 text-gray-900">Match any motif</label>
          </div>
          <div class="flex items-center">
            <input value="exclusive" bind:group={$rogerMotifsCombination} id="combined-motifs-exclusive" name="combined-motifs" type="radio" class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600">
            <label for="combined-motifs-exclusive" class="ml-1.5 block leading-6 text-gray-900">Match all motifs</label>
          </div>
        </div>
      </div>
    {/if}
  </div>
  {#if $rogerMotifs.length > 1}
    <button on:click={() => {
      $rogerMotifs = [];
    }} class="rounded bg-white px-2 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
      Remove all
    </button>
  {/if}
</div>


<ul
  role="list"
  class="{$rogerMotifsCombination == 'inclusive' && $rogerMotifs.length > 1 ? 'space-y-3' : 'divide-y divide-gray-100 bg-white rounded-md border shadow-sm border-gray-200'}"
>
  {#each $rogerMotifs as motif (motif.id)}
    <li
      class="flex items-center justify-between py-3 pl-4 pr-5 leading-6 {$rogerMotifsCombination == 'inclusive' && $rogerMotifs.length > 1 ? 'bg-white rounded-md border shadow-sm border-gray-200' : ''}"
    >
      <div class="flex w-0 flex-1 items-center">
        <RogerIcon iconName={motif.category} />
        <div class="ml-4 flex min-w-0 flex-1 gap-2 items-center">
          <span class="truncate text-sm font-medium text-gray-900"
            >{motif.description}</span
          >
          <span class=" text-gray-500 text-sm"
            >{motif.messages?.length} messages</span
          >
        </div>
      </div>
      <button
        on:click={() => {
          $rogerMotifs = $rogerMotifs.filter((m) => m.id !== motif.id);
        }}
        type="button"
        class="font-medium text-sm text-gray-700 px-2 py-1 rounded-full hover:bg-gray-100 hover:text-gray-900"
        >Remove</button
      >
    </li>
  {/each}
</ul>