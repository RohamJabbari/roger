<script>
  import { createEventDispatcher } from "svelte";
  import RogerIcon from "$lib/components/RogerIcon.svelte";

  const dispatch = createEventDispatcher();

  export let motif;
</script>

<button
  on:click={() => {
    dispatch("motifSelected", { motif: structuredClone(motif) });
    // selectedPredefinedMotif = structuredClone(motif);
    // predefinedMotifForm.requestSubmit();
  }}
  class="w-full relative flex items-center space-x-3 rounded-lg border border-gray-300 bg-white py-3 px-4 shadow-sm hover:ring-2 hover:ring-offset-1 hover:ring-slate-500"
>
  <div class="flex-shrink-0 text-slate-400">
    <RogerIcon iconName={motif.category} />
  </div>
  <div
    class="min-w-0 flex-1 font-semibold leading-5 text-sm text-left text-gray-900"
  >
    {motif.description}
  </div>
</button>