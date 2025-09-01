<script>
  import { Button, Alert, Spinner } from "flowbite-svelte";
  import { getRandomId } from "$lib/utils";
  import { enhance } from "$app/forms";
  import { rogerRecording, rogerMotifs } from "$lib/stores/app";

  let loadCustomMotif = false;
  let userPrompt = '';
  let errorMessage = null;
</script>

<form
  action="?/prompt-transcript"
  method="POST"
  use:enhance={({ formData }) => {
    loadCustomMotif = true;
    errorMessage = null;
    return async ({ result, update }) => {
      loadCustomMotif = false;
      if (result.type === "failure") {
        errorMessage =
          "An error occurred. Please try again or change your motif.";
      } else {
        $rogerMotifs.push({
          id: getRandomId(),
          description: userPrompt,
          messages: result.data.message_ids,
          custom: true,
          category: 'content-based'
        });
        $rogerMotifs = $rogerMotifs;
        userPrompt = "";
      }
      update({ reset: true });
    };
  }}
>
  {#if errorMessage}
    <Alert
      color="none"
      class="bg-rose-200 mb-3 text-rose-900"
      dismissable
    >
      {errorMessage}
    </Alert>
  {/if}
  <input type="hidden" name="recording_id" value={$rogerRecording} />
  <label for="user_prompt" class="block text-sm leading-6 text-gray-500"
    >Describe a communication pattern or wording.</label
  >
  <div class="mt-2">
    <textarea
      bind:value={userPrompt}
      id="user_prompt"
      name="user_prompt"
      rows="3"
      class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
    ></textarea>
  </div>
  <div class="flex justify-end mt-4">
    <Button type="submit" color="green" disabled={userPrompt.length < 3}>
      {#if loadCustomMotif}
        <Spinner class="me-3" size="4" color="white" />Loading ...
      {:else}
        Save
      {/if}
    </Button>
  </div>
</form>