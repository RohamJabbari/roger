<script>
  import { speakerColorScale } from "$lib/stores/speaker";
  import { createEventDispatcher } from "svelte";
  import { rogerTime } from "$lib/stores/app";
  import { Tooltip } from 'flowbite-svelte';
  import { secondsToTime } from '$lib/utils';
  
  const dispatch = createEventDispatcher();

  let messageElements = [];
  let currTime = 0;

  export let data = [];

  export function scrollToTime(seconds) {
    let closestElement = null;
    let closestDifference = Infinity;

    messageElements.forEach(element => {
      if (!element || !element.dataset) return;
      const messageTime = element.dataset.start;
      const difference = Math.abs(messageTime - seconds);

      if (difference < closestDifference) {
        closestDifference = difference;
        closestElement = element;
      }
    });

    if (closestElement) {
      closestElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function isWithinTimeRange(start, currentTime) {
    return Math.abs(start - currentTime) <= 3;
  }

  $: if ($rogerTime && messageElements.length > 0 && parseInt($rogerTime) !== currTime) {
    scrollToTime($rogerTime-5);
    currTime = parseInt($rogerTime);
  }
</script>

<div id="conversation-log" class="flex flex-col max-h-16 max-w-72 overflow-auto">
  {#each data as message, index}
    <div class="flex gap-x-2 leading-none" bind:this={messageElements[index]} data-start={message.start}>
      <div>
        <button
          on:click={() =>
            dispatch("playSpeaker", {
              speaker: message.speaker,
              start: message.start,
              end: message.end,
            })}
          style="background: {$speakerColorScale
            ? $speakerColorScale(message.speaker)
            : '#ccc'}"
          class="hover:opacity-80 rounded-full flex-none text-white font-semibold text-xs w-9 text-center"
          >{message.speaker}</button
        >
        <Tooltip>{secondsToTime(message.start)}</Tooltip>
      </div>
      <div class={`text-xs ${isWithinTimeRange(parseInt(message.start), parseInt($rogerTime)) ? 'font-bold' : ''}`}>{message.text}</div>
    </div>
  {:else}
    <p>Loading...</p>
  {/each}
</div>

<style lang="postcss">
  :root {
    --fadeHeight: 20px;
  }

  #conversation-log {
    mask-image:
      linear-gradient(
        to top,
        transparent,
        transparent var(--fadeHeight),
        black var(--fadeHeight),
        black calc(100% - var(--fadeHeight)),
        transparent
      ),
      linear-gradient(
        to bottom,
        transparent,
        transparent var(--fadeHeight),
        black var(--fadeHeight),
        black calc(100% - var(--fadeHeight)),
        transparent
      );
  }

  #conversation-log {
    padding-block: var(--fadeHeight);
  }

  ::-webkit-scrollbar {
    width: 5px;
    background-color: #f5f5f5;
  }

  /* Make scrollbar visible when needed */
  ::-webkit-scrollbar-thumb {
    background-color: #d4bbbb;
    border-radius: 12px;
  }

  /* Make scrollbar track visible when needed */
  ::-webkit-scrollbar-track {
    background: transparent;
  }
</style>