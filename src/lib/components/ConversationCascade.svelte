<script>
  import { scaleBand } from "d3-scale";
  import { speakerColorScale } from "$lib/stores/speaker";
  import { createEventDispatcher } from "svelte";
import { rogerTime } from "$lib/stores/app";
  import { onMount } from "svelte";
  import SamGlyph from "./SamGlyph.svelte";
  import { showEmotions } from '$lib/stores/app';
  import MessageBox from "$lib/components/rohams-suggestions/MessageBox.svelte";

  const dispatch = createEventDispatcher();

  let messageElements = [];
  let currTime = 0;
  let containerWidth = 0;
  let yScale;

  let messageHeights = {};

  export let data = [];
  export let speakers = [];

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
      closestElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function isWithinTimeRange(start, currentTime) {
    return Math.abs(start - currentTime) <= 3;
  }

  function calculatePositions(messages, heights) {
    let positions = {};
    let lastPosition = {};

    messages.forEach((message, index) => {
      let prevMessage = index > 0 ? messages[index - 1] : null;
      let speaker = message.speaker;
      let position;

      if (!prevMessage) {
        // Position the first message of the first speaker
        position = { id: message.id, top: 10, speaker: speaker };
      } else if (speaker === prevMessage.speaker) {
        // Position directly below the previous message from the same speaker
        position = {
          id: message.id,
          top: lastPosition[speaker].top + lastPosition[speaker].height + 10, // 10px gap
          speaker: speaker
        };
      } else {
        // Position for a different speaker
        let previousSpeaker = lastPosition[prevMessage.speaker];
        let currentSpeakerLastPos = lastPosition[speaker];

        if (message.start === prevMessage.start) {
            position = {
              id: message.id,
              top: previousSpeaker.top,
              speaker: speaker
            };
          } else {
            // Check to ensure no overlap with the last message from the same speaker
            let calculatedTop = previousSpeaker.top + 20; // 20px down compared to previous message
            let lastSpeakerTop = currentSpeakerLastPos
                ? currentSpeakerLastPos.top + currentSpeakerLastPos.height + 4 // 10px gap below the last message of the same speaker
                : 10;

            position = {
              id: message.id,
              top: Math.max(calculatedTop, lastSpeakerTop),
              speaker: speaker
            };
          }
      }

      // Update last position for the current speaker
      lastPosition[speaker] = { ...position, height: heights[message.id] };
      positions[position.id] = position;
    });

    return positions;
  }

  // Calculate positions reactively
  $: positions = calculatePositions(data, messageHeights);

  $: if (
    $rogerTime &&
    messageElements.length > 0 &&
    parseInt($rogerTime) !== currTime
  ) {
    scrollToTime($rogerTime - 5);
    currTime = parseInt($rogerTime);
  }

  $: speakerColumnScale = scaleBand().domain(speakers).range([0, containerWidth]).padding(0.05);

  onMount(() => {
    setTimeout(() => {
      const elements = document.querySelectorAll(".message");
      messageHeights = {};

      elements.forEach((el) => {
        const messageId = el.getAttribute('data-id');
        messageHeights[messageId] = el.offsetHeight;
      });
    }, 100);
  });

</script>

<div
  class="relative w-full overflow-auto"
  bind:clientWidth={containerWidth}
>
  {#each data as message, index (message.id)}
    <div
      class="drop-shadow flex message absolute"
      style="min-width: 360px; max-width: {speakerColumnScale.bandwidth()}px; top: {positions[message.id]?.top || 0}px; left: {speakerColumnScale(positions[message.id]?.speaker)}px;"
      bind:this={messageElements[index]}
      data-start={message.start}
      data-id={message.id}
    >
      <MessageBox
              message={message}
              color={$speakerColorScale(message.speaker)}
              on:navigateTime={(event) => scrollToTime(event.detail.time)}
              on:playSpeaker={(event) => dispatch("playSpeaker", event.detail)}
      />
<!--      <div class="place-content-center">-->
<!--        <button-->
<!--          on:click={() =>-->
<!--            dispatch("playSpeaker", {-->
<!--              speaker: message.speaker,-->
<!--              start: message.start,-->
<!--              end: message.end,-->
<!--            })}-->
<!--          style="background: {$speakerColorScale-->
<!--            ? $speakerColorScale(message.speaker)-->
<!--            : '#ccc'}"-->
<!--          class="rounded-tl-lg h-full hover:opacity-80 flex-none text-white font-semibold leading-5 text-sm w-9 text-center"-->
<!--          >{message.speaker}</button-->
<!--        >-->
<!--      </div>-->
<!--      <div-->
<!--        class={`px-2 py-1.5 leading-4 rounded-r-lg text-sm ${isWithinTimeRange(parseInt(message.start), parseInt($rogerTime)) ? "font-bold" : "text-gray-600"}`}-->
<!--        style="background: {$speakerColorScale(message.speaker)}50"-->
<!--      >-->
<!--        {@html message.text_llm_en ?? '<i>incomp.</i>'}-->
<!--      </div>-->
<!--      {#if $showEmotions}-->
<!--        <SamGlyph -->
<!--          arousal={message.arousal_level}-->
<!--          valence={message.valence_level}-->
<!--          dominance={message.dominance_level}-->
<!--        />-->
<!--      {/if}-->
    </div>
  {:else}
    <p>Loading...</p>
  {/each}
</div>
