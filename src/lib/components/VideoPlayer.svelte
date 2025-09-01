<script>
  import { onMount } from 'svelte';
  import Plyr from 'plyr';
  import 'plyr/dist/plyr.css';
  import { rogerTime, rogerPlaying } from '$lib/stores/app';

  export let src;
  export let newWindow;

  let options = {
    controls: ['current-time'],
    muted: true,
    volume: 0,
    invertTime: false
  };
  let player;
  
  onMount(() => {
    let playerElement = newWindow.document.getElementById('player');
    player = new Plyr(playerElement, options);
    player.muted = true;
    player.volume = 0;

    return () => {
      player.destroy();
    };
  });

  export const setSource = () => {
    player.source = {
      type: 'video',
      sources: [
        {
          src: src,
          type: 'video/mp4',
        },
      ],
    };
  }

  $: if (player && player.elements) player.currentTime = $rogerTime;
  $: if (player && player.elements && $rogerPlaying !== player.playing) {
    if ($rogerPlaying) {
      player.play();
    } else {
      player.pause();
    }
  }
</script>

<!-- svelte-ignore a11y-media-has-caption -->
<video id="player" class="plyr" controls>
  <source {src} type="video/mp4" />
</video>