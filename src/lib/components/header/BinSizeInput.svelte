<script>
  export let binSize;
</script>

<div class="flex gap-3 items-center group">
  <div class="font-medium text-sm select-none">Resolution</div>
  <input
    class="accent-gray-500 w-16"
    type="range"
    min={2}
    max={30}
    step={1}
    bind:value={binSize}
  />
</div>