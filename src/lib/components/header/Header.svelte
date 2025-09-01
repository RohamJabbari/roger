<script>
    import DataSourceInput from "./DataSourceInput.svelte";
</script>
<div class="px-4 py-3 flex items-center justify-between">
  <div class="flex gap-x-4 items-center">
    <img src="img/roger_logo.png" alt="ROGER logo" class="h-6" />
    <div class="flex-none font-light text-xl text-gray-400 pl-1">/</div>
    <DataSourceInput />
  </div>
  <div><slot name="center" /></div>
  <div><slot name="right" /></div>
</div>