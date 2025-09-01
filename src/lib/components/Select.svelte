<script>
  export let onChange = null;
  export let value;
</script>

<select {...$$restProps} bind:value={value} on:change={onChange} id="location" name="location" class="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 font-semibold ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
  <slot />
</select>