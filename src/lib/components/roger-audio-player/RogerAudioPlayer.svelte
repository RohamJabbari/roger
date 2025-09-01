<script>
  import { Dropdown, Radio } from "flowbite-svelte";
  import { createEventDispatcher } from "svelte";
  import { getAudioContext } from "svelte-audio-player";
  import { toggle, toHHMMSS } from "svelte-audio-player/utils";
  import RangeSlider from "./RangeSlider.svelte";
  import { speakerColorScale } from "$lib/stores/speaker";
  import { rogerTime, rogerPlaying } from "$lib/stores/app";

  const dispatch = createEventDispatcher();

  export let speakers = [];
  export let showVideo = false;

  // this is passed in from the parent; do NOT mutate it here
  export let activeAudioSpeaker = "All";

  let speakersDropdownOpen = false;

  const {
    currentTime,
    repeat,
    duration,
    playing,
    volume,
    muted,
    ended,
    paused,
    playbackRate,
    seekBy,
    seekTo,
  } = getAudioContext();

  // ---- SEEK WITHOUT PLAY (robust against src switches) ----
  // Use a token so older, slower "waiters" don't override a newer request.
  let lastSeekToken = 0;

  export async function seekOnly(time) {
    if (!Number.isFinite(time)) return;
    const myToken = ++lastSeekToken;

    // fast path: if duration looks valid, just seek
    if (Number.isFinite($duration) && $duration > 0) {
      seekTo(time);
      $rogerTime = time;
      return;
    }

    // slow path: wait until the new media is ready
    const start = performance.now();
    const TIMEOUT_MS = 3000;
    const INTERVAL_MS = 50;

    await new Promise((resolve) => {
      const iv = setInterval(() => {
        // if a newer seekOnly was called, abort this one
        if (myToken !== lastSeekToken) {
          clearInterval(iv);
          resolve();
          return;
        }

        const ready = Number.isFinite($duration) && $duration > 0;
        const timedOut = performance.now() - start > TIMEOUT_MS;

        if (ready || timedOut) {
          clearInterval(iv);
          resolve();
        }
      }, INTERVAL_MS);
    });

    if (myToken !== lastSeekToken) return; // superseded

    // do the seek; even if we timed out, try anyway
    seekTo(time);
    $rogerTime = time;
    // IMPORTANT: do not touch $paused — if paused, it stays paused
  }

  // (optional) seek + play for other UI flows
  export async function playSpeaker(time) {
    await seekOnly(time);
    $paused = false; // only if you explicitly want to start playback
  }

  let volumePercentage = 100;
  $: $volume = volumePercentage / 100;

  // keep these in sync for the rest of the app
  $: $rogerTime = $currentTime;
  $: $rogerPlaying = $playing;
</script>

<div class="flex gap-4 p-2 items-center bg-[#ece7df] rounded-full">
  <div class="flex items-center gap-2">
    <button
      class="flex text-gray-600 items-center rounded-full pl-1.5 pr-2 py-2 transition-colors hover:bg-[#dbd5cb]"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        class="size-4"
      >
        <path
          d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z"
        />
      </svg>
      <span class="text-sm font-bold">{activeAudioSpeaker}</span>
    </button>
    <Dropdown class="w-36 p-2 space-y-1 text-sm" bind:open={speakersDropdownOpen}>
      <li>
        <Radio on:change={() => (speakersDropdownOpen = false)} name="custom" custom bind:group={activeAudioSpeaker} value="All"
          ><div class="w-full rounded p-1 hover:bg-gray-100 peer-checked:bg-gray-200">
            All combined
          </div></Radio
        >
      </li>
      {#each speakers as speaker}
        <li>
          <Radio on:change={() => (speakersDropdownOpen = false)} name="custom" custom bind:group={activeAudioSpeaker} value={speaker}
            ><div class="w-full rounded p-1 hover:bg-gray-100 peer-checked:bg-gray-200">
              Participant {speaker}
            </div></Radio
          >
        </li>
      {/each}
    </Dropdown>
    <button
      on:click={() => toggle(paused)}
      class="w-9 h-9 rounded-full flex justify-center items-center hover:opacity-80"
      style="background: {$speakerColorScale && activeAudioSpeaker !== 'All'
        ? $speakerColorScale(activeAudioSpeaker)
        : '#9d9d9d'}"
    >
      {#if $paused}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
          />
        </svg>
      {:else}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-5"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15.75 5.25v13.5m-7.5-13.5v13.5"
          />
        </svg>
      {/if}
    </button>
  </div>

  <div class="flex gap-2 items-center">
    <div class="w-32">
      <RangeSlider max={$duration} bind:value={$currentTime} />
    </div>
    <div
      class="text-sm flex text-center justify-center tabular-nums font-semibold text-gray-700 w-24"
    >
      {toHHMMSS($currentTime)} / {toHHMMSS($duration)}
    </div>
    <div class="volume flex justify-center relative transition-all">
      <button on:click={() => toggle(muted)} class="hover:bg-[#dbd5cb] rounded-full p-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          class="size-4 text-gray-700"
        >
          {#if $muted}
            <path d="M7.557 2.066A.75.75 0 0 1 8 2.75v10.5a.75.75 0 0 1-1.248.56L3.59 11H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.59l3.162-2.81a.75.75 0 0 1 .805-.124ZM11.28 5.72a.75.75 0 1 0-1.06 1.06L11.44 8l-1.22 1.22a.75.75 0 1 0 1.06 1.06l1.22-1.22 1.22 1.22a.75.75 0 1 0 1.06-1.06L13.56 8l1.22-1.22a.75.75 0 0 0-1.06-1.06L12.5 6.94l-1.22-1.22Z" />          
          {:else}
            <path
              d="M7.557 2.066A.75.75 0 0 1 8 2.75v10.5a.75.75 0 0 1-1.248.56L3.59 11H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.59l3.162-2.81a.75.75 0 0 1 .805-.124ZM12.95 3.05a.75.75 0 1 0-1.06 1.06 5.5 5.5 0 0 1 0 7.78.75.75 0 1 0 1.06 1.06 7 7 0 0 0 0-9.9Z"
            />
            <path
              d="M10.828 5.172a.75.75 0 1 0-1.06 1.06 2.5 2.5 0 0 1 0 3.536.75.75 0 1 0 1.06 1.06 4 4 0 0 0 0-5.656Z"
            />
          {/if}
        </svg>
      </button>
      <div class="volume-control bg-[#dbd5cb] rounded-full w-20 h-8 px-3 flex justify-center origin-left -rotate-90 absolute top-[100px] left-[50%]">
        <RangeSlider volumeSlider={true} bind:value={volumePercentage} max={100} step={1} />
      </div>
    </div>
    <button
      on:click={() => {
        if (showVideo) {
          dispatch("hideVideo");
          showVideo = false;
        } else {
          dispatch("openVideo");
          showVideo = true;
        }
      }}
      class="flex text-gray-600 items-center rounded-full pl-1.5 pr-2 py-2 transition-colors hover:text-gray-900 hover:bg-[#dbd5cb]"
    >
      {#if showVideo}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5 text-gray-700">
          <path d="M3.25 4A2.25 2.25 0 0 0 1 6.25v7.5A2.25 2.25 0 0 0 3.25 16h7.5A2.25 2.25 0 0 0 13 13.75v-7.5A2.25 2.25 0 0 0 10.75 4h-7.5ZM19 4.75a.75.75 0 0 0-1.28-.53l-3 3a.75.75 0 0 0-.22.53v4.5c0 .199.079.39.22.53l3 3a.75.75 0 0 0 1.28-.53V4.75Z" />
        </svg>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="size-5">
          <path d="M1 13.75V7.182L9.818 16H3.25A2.25 2.25 0 0 1 1 13.75ZM13 6.25v6.568L4.182 4h6.568A2.25 2.25 0 0 1 13 6.25ZM19 4.75a.75.75 0 0 0-1.28-.53l-3 3a.75.75 0 0 0-.22.53v4.5c0 .199.079.39.22.53l3 3a.75.75 0 0 0 1.28-.53V4.75ZM2.28 4.22a.75.75 0 0 0-1.06 1.06l10.5 10.5a.75.75 0 1 0 1.06-1.06L2.28 4.22Z" />
        </svg>      
      {/if}            
    </button>
  </div>
</div>

<style lang="postcss">
  .volume-control {
    @apply opacity-0 transition-opacity;
  }
  .volume:hover .volume-control {
    @apply opacity-100;
    @apply delay-300;
  }
</style>