<script>
  import { conversationPosition } from "$lib/stores/app";
</script>

<span class="isolate inline-flex rounded-md shadow-sm z-50">
  <button on:click={() => $conversationPosition = 'bottom'} type="button" class="relative inline-flex items-center rounded-l-md px-2 py-1.5 ring-1 ring-inset ring-gray-300 bg-[#f5f2ed] hover:bg-gray-50 focus:z-10">
    <span class="sr-only">Bottom</span>
    <svg fill="currentColor" class="w-5 h-5 {$conversationPosition == 'bottom' ? 'text-gray-600' : 'text-gray-400 hover:text-gray-600' }" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="m4.168 62.5v17.75c0 1.1055 0.4375 2.1641 1.2188 2.9453s1.8398 1.2227 2.9453 1.2227h83.336c1.1055 0 2.1641-0.44141 2.9453-1.2227s1.2188-1.8398 1.2188-2.9453v-17.75z" />
      <path d="m95.832 58.332v-37.5c0-1.1055-0.4375-2.1641-1.2188-2.9453s-1.8398-1.2188-2.9453-1.2188h-83.336c-2.3008 0-4.1641 1.8633-4.1641 4.1641v37.5z" />
    </svg>
  </button>
  <button on:click={() => $conversationPosition = 'right'} type="button" class="relative -ml-px inline-flex items-center rounded-r-md px-2 py-1.5 ring-1 ring-inset ring-gray-300 bg-[#f5f2ed] hover:bg-gray-50 focus:z-10">
    <span class="sr-only">Right</span>
    <svg fill="currentColor" class="w-5 h-5 {$conversationPosition == 'right' ? 'text-gray-600' : 'text-gray-400 hover:text-gray-600' }" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <path d="m62.5 16.668h-54.168c-2.3008 0-4.1641 1.8633-4.1641 4.1641v58.336c0 1.1055 0.4375 2.1641 1.2188 2.9453s1.8398 1.2188 2.9453 1.2188h54.168z" />
      <path d="m91.668 16.668h-25v66.664h25c1.1055 0 2.1641-0.4375 2.9453-1.2188s1.2188-1.8398 1.2188-2.9453v-58.336c0-1.1055-0.4375-2.1641-1.2188-2.9453s-1.8398-1.2188-2.9453-1.2188z" />
    </svg>
  </button>
</span>