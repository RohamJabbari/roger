<script>
  import { speakerColorScale } from "$lib/stores/speaker";
  import { createEventDispatcher } from "svelte";
  import { rogerTime } from "$lib/stores/app";
  import { Tooltip } from "flowbite-svelte";
  import { secondsToTime } from "$lib/utils";
  import MessageBox from "$lib/components/rohams-suggestions/MessageBox.svelte";
  import SamGlyph from "./SamGlyph.svelte";
  import { showEmotions } from '$lib/stores/app';

  const dispatch = createEventDispatcher();

  let messageElements = [];
  let currTime = 0;

  // NEW: container ref + auto-follow state
  let containerEl;
  let autoFollow = true;          // follows the audio time by default
  let suppressScrollDetect = false; // suppress flag for programmatic scrolls

  export let data = [];

  export function scrollToTime(seconds) {
    let closestElement = null;
    let closestDifference = Infinity;

    messageElements.forEach((element) => {
      if (!element) return;
      const messageTime = element.dataset.start;
      const difference = Math.abs(messageTime - seconds);

      if (difference < closestDifference) {
        closestDifference = difference;
        closestElement = element;
      }
    });

    if (closestElement) {
      // mark that the upcoming scroll event is programmatic
      suppressScrollDetect = true;
      closestElement.scrollIntoView({ behavior: "smooth", block: "start" });
      // clear suppression shortly after the smooth scroll is initiated
      setTimeout(() => (suppressScrollDetect = false), 350);
    }
  }

  function isWithinTimeRange(start, currentTime) {
    return Math.abs(start - currentTime) <= 5;
  }

  // NEW: handle user-driven scroll to disable auto-follow
  function onUserScroll() {
    if (suppressScrollDetect) return; // ignore programmatic scrolls
    if (autoFollow) autoFollow = false;
  }

  // NEW: go live button handler
  function goLive() {
    autoFollow = true;
    // jump close to the current roger time
    scrollToTime(($rogerTime ?? 0) - 5);
  }

  // Only auto-scroll when autoFollow === true
  $: if (
          autoFollow &&
          $rogerTime &&
          messageElements.length > 0 &&
          parseInt($rogerTime) !== currTime
  ) {
    scrollToTime($rogerTime - 5);
    currTime = parseInt($rogerTime);
  }
</script>

<div
        class="flex flex-col gap-2 py-2 overflow-auto relative"
        style="min-width: 360px;"
        bind:this={containerEl}
        on:scroll={onUserScroll}
        on:wheel={onUserScroll}
        on:touchmove={onUserScroll}
>
  {#each data as message, index}
    <div class="flex items-stretch"
         bind:this={messageElements[index]}
         data-start={message.start}>
      <MessageBox
              message={message}
              color={$speakerColorScale(message.speaker)}
              on:navigateTime={(event) => scrollToTime(event.detail.time)}
              on:playSpeaker={(event) => dispatch("playSpeaker", event.detail)}
      />
    </div>
  {:else}
    <p>Loading...</p>
  {/each}

  <!-- NEW: “Go live” button when auto-follow is OFF -->
  {#if !autoFollow}
    <button
            class="fixed bottom-3 right-4 px-3 py-2 rounded-full shadow-md bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800"
            on:click={goLive}
            title="Jump to current playback position and re-enable auto-follow"
    >
      Go live
    </button>
  {/if}
</div>