<script>
  import "../app.css";
  import { fade } from 'svelte/transition';
  import { tooltip } from '$lib/stores/app';
</script>

<slot />

{#if $tooltip && $tooltip.x}
	<div
		transition:fade
		class="fixed bg-gray-900 text-white rounded-md shadow-lg p-2 z-40 max-w-48"
		style="left: {$tooltip.x}px; top: {$tooltip.y}px"
	>
		{@html $tooltip.content}
	</div>
{/if}

<style lang="postcss">
  :global(body) {
    background: #f5f2ed;
  }
</style>