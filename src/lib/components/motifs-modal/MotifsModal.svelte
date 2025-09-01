<script>
  import { predefinedMotifs, motifCategories } from "$lib/constants";
  import { rogerRecording, rogerMotifs, rogerMotifsCombination } from "$lib/stores/app";
  import { enhance } from "$app/forms";
  import { Tabs, TabItem, Button, Alert, Spinner } from "flowbite-svelte";
  import PredefinedMotifButton from "./PredefinedMotifButton.svelte";
  import YourMotifs from "./YourMotifs.svelte";
  import CustomMotif from "./CustomMotif.svelte";
  
  export let motifFilter;

  let errorMessage = null;
  let userPrompt = "";
  
  let predefinedMotifForm;
  let selectedPredefinedMotif;

  $: openTab = $rogerMotifs.length > 0 ? "your_motifs" : "choose_motif";
  $: rogerMotifIds = $rogerMotifs.map((m) => m.id);

  function predefinedMotifSelected(e) {
    selectedPredefinedMotif = e.detail.motif;
    if (selectedPredefinedMotif.type === 'llm') {
      predefinedMotifForm.requestSubmit();
    } else {
      selectedPredefinedMotif.messages = motifFilter.getMessagesForMotif(selectedPredefinedMotif.id) || [];
      $rogerMotifs.push(selectedPredefinedMotif);
      $rogerMotifs = $rogerMotifs;
      selectedPredefinedMotif = null;
    }
  }
</script>

<div>
  <h2 class="px-4 pt-4 pb-2 font-semibold text-lg text-gray-900">Motifs</h2>

  <Tabs tabStyle="underline" contentClass="p-4 bg-gray-50 rounded-lg">
    {#if $rogerMotifs.length > 0}
      <TabItem
        open={openTab === "your_motifs"}
        title="Your motifs"
      >
        <YourMotifs />
      </TabItem>
    {/if}
    <TabItem open={openTab === "choose_motif"} title="Choose motif">
      <form
          bind:this={predefinedMotifForm}
          action="?/prompt-transcript"
          method="POST"
          use:enhance={({ formData }) => {
            formData.append('recording_id', $rogerRecording);
            formData.append('user_prompt', selectedPredefinedMotif.user_prompt);
            errorMessage = null;
            return async ({ result, update }) => {
              if (result.type !== "failure") {
                selectedPredefinedMotif.messages = result.data.message_ids;
                $rogerMotifs.push(selectedPredefinedMotif);
                $rogerMotifs = $rogerMotifs;
                selectedPredefinedMotif = null;
              }
              update({ reset: false });
            };
          }}
        ></form>
        
        <div>
          {#each motifCategories as motifCat, index}
            <h3 class="font-semibold text-sm text-gray-600 mb-1 {index > 0 ? 'mt-3' : ''}">{motifCat.title}</h3>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {#each predefinedMotifs.filter(d => d.category === motifCat.key && !rogerMotifIds.includes(d.id)) as motif (motif.id)}
                <PredefinedMotifButton motif={motif} on:motifSelected={predefinedMotifSelected} />
              {/each}
            </div>
          {/each}
        </div>

    </TabItem>
    <TabItem title="New custom motif">
      <CustomMotif />
    </TabItem>
  </Tabs>
</div>
