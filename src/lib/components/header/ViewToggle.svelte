<script>
  import { rogerMode } from '$lib/stores/app';
  import { Radio } from "flowbite-svelte";
  const modes = [
    { key: "flow", title: "Flow" },
    { key: "topic", title: "Topic" },
    { key: "summary", title: "Summary" }
  ];
  // const modes = [
  //   { key: "details", title: "Detailed" },
  //   { key: "summary", title: "Summarized" }
  // ];
</script>

<div class="flex items-center p-1 bg-[#ece7df] rounded-full">
  {#each modes as modeOption}
    <button class="rounded-full py-3 px-3 text-sm font-semibold transition-colors {$rogerMode == modeOption.key ? 'bg-[#dbd5cb]' : 'text-gray-500 hover:text-black'}" on:click={() => ($rogerMode = modeOption.key)}>
      {modeOption.title}
    </button>
  {/each}
</div>