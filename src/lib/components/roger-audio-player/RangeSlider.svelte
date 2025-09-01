<script>
  export let min = 0;
  export let max = 1;
  export let value;
  export let step = 0.01;
  export let volumeSlider = false;
</script>

<div class="relative flex items-center flex-1">
  <div class="h-1 w-full rounded-full {volumeSlider ? 'bg-gray-100' : 'bg-gray-300'} absolute" />
  <div
    class="h-1 rounded-l-full bg-gray-500 absolute"
    style={`width: ${(value * 100) / max}%;`}
  />
  <input
    bind:value
    {min}
    {max}
    {step}
    type="range"
    class="w-full absolute h-2 appearance-none bg-transparent outline-none"
  />
</div>

<style>
  input[type='range']::-webkit-slider-thumb {
    -webkit-appearance: none;
    @apply w-3 h-3 cursor-pointer;
    @apply bg-gray-700;
  }

  input[type='range']::-webkit-slider-thumb:hover {
    @apply bg-gray-600;
  }
</style>