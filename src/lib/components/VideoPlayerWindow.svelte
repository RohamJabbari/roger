<script>
  import { onDestroy } from "svelte";
  import VideoPlayer from "$lib/components/VideoPlayer.svelte";
  
  export let recording = 50;
  export let videoOptions = [];
  export let newWindow;

  let videoPlayer;
  let selectedVideoOption = "overview";
</script>

<div class="bg-[#0F1C26] h-screen w-screen">
  <div>
    <select
      class="bg-slate-700 border-0 text-white w-full px-2 py-1"
      on:change={(event) => {
        selectedVideoOption = event.target.value.toString();
        setTimeout(() => {
          videoPlayer.setSource();
        }, 100);
      }}
      value={selectedVideoOption}
    >
      {#each videoOptions as videoOption}
        <option value={videoOption.value.toString()}>
          {#if videoOption.value != 'overview'}Participant {/if}{videoOption.name}
        </option>
      {/each}
    </select>
  </div>
  <VideoPlayer
    src={`data/${recording}/video_${selectedVideoOption}.mp4`}
    bind:this={videoPlayer}
    {newWindow}
  />
</div>

<style>
</style>
