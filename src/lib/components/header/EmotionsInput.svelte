<script>
  import { showEmotions } from '$lib/stores/app';
  import SamGlyph from '../SamGlyph.svelte';

  const debugMode = false;

  $: if (debugMode) console.log('show emotions', $showEmotions);
</script>
<button on:click={() => $showEmotions = !$showEmotions } class="flex gap-1 px-3 items-center group rounded-full hover:bg-[#ece7df] {$showEmotions ? 'opacity-100' : 'opacity-40'}">
  <div class="font-medium text-sm select-none">Emotions</div>
  <SamGlyph valence={4} arousal={3} dominance={4} size={20} />
</button>