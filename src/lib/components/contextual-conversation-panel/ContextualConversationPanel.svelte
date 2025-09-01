<script>
  import { contextPanel } from '$lib/stores/app';
  import { clickOutside } from '$lib/clickOutsideDetector.js';
  import ConversationLog from '$lib/components/ConversationLog.svelte';


  const offset = { x: 10, y: 14 };
  let panelRef;

  function handleClickOutside(event) {
    $contextPanel = null;
  }

</script>

{#if $contextPanel && $contextPanel.open}
  <div use:clickOutside on:click_outside={handleClickOutside} class="absolute overflow-y-auto bg-white border max-w-80 max-h-52 shadow-lg rounded-md p-3 pt-1" style="left: {$contextPanel.x + offset.x}px; top: {$contextPanel.y + offset.y}px">
    {#if $contextPanel.transcript?.length > 0}
      <ConversationLog
        data={$contextPanel.transcript}
      />
    {/if}
  </div>
{/if}

{#if $contextPanel && !$contextPanel.open && $contextPanel.x }
  <div class="absolute bg-gray-900 {$contextPanel && !$contextPanel.open ? 'opacity-80' : 'opacity-0'} text-white shadow-sm rounded p-1" style="left: {$contextPanel ? $contextPanel.x + offset.x : 0}px; top: {$contextPanel ? $contextPanel.y + offset.y : 0}px">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="size-4">
      <path fill-rule="evenodd" d="M2 3.75A.75.75 0 0 1 2.75 3h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 3.75ZM2 8a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 8Zm0 4.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd" />
    </svg>      
  </div>
{/if}