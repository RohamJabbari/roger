<script>
  import { rogerRecording } from '$lib/stores/app';
</script>

<select bind:value={$rogerRecording} class="text-sm text-gray-600 hover:text-gray-900 cursor-pointer transition-colors font-semibold border-0 focus:ring-0 p-0">
  <option value={50}>Group 1</option>
  <option value={51}>Group 2</option>
</select>

<style lang="postcss">
  select {
    -moz-appearance: none; /* Firefox */
    -webkit-appearance: none; /* Safari and Chrome */
    appearance: none; /* Standard */
    background: none;
  }
</style>