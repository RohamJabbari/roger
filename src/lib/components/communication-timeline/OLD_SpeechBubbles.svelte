<script>
  import { speakerColorScale, speakerDarkColorScale } from "$lib/stores/speaker";
  import { scaleLinear, scaleBand } from "d3-scale";
  import { filterTimeRange } from "$lib/stores/app";
  import { stressLevels } from "$lib/utils";

  let speechBubbleData = [];
  let verticalPositions = [];
  let speakerPositions = {};
  let speakerBandHeight = 45;

  export let timelineScale;
  export let transcriptData = [];
  export let speakers = [];
  export let height = 400;

  function getTextWidth(text, font) {
    let canvas =
      getTextWidth.canvas ||
      (getTextWidth.canvas = document.createElement("canvas"));
    let context = canvas.getContext("2d");
    context.font = font;
    let metrics = context.measureText(text);
    return Math.round(metrics.width);
  }

  function preprocessVerticalPositions(data) {
    verticalPositions = [];

    data.forEach((d, index) => {
      if (!d.text_level1 || d.text_level1.length == 0) return;
      const textWidth = Math.min(
        120,
        getTextWidth(d.text_level1, "bold 12pt arial"),
      );
      d.x_pos_start = timelineScale(d.start_sec);
      d.x_pos_end = d.x_pos_start + textWidth;

      if (index == 0) {
        d.yPos = 0;
        verticalPositions[0] = d.x_pos_end + 10;
      } else {
        let useExistingLevel = false;
        verticalPositions.forEach((pos, i) => {
          if (pos <= d.x_pos_start && !useExistingLevel) {
            d.yPos = i;
            verticalPositions[i] = d.x_pos_end + 10;
            useExistingLevel = true;
          }
        });

        if (!useExistingLevel) {
          d.yPos = verticalPositions.length;
          verticalPositions.push(d.x_pos_end + 10);
        }
      }
    });

    return data;
  }

  function getStressLevelClasses(stress_level) {
    const size = stressLevels[stress_level].size;
    const halfSize = size / 2;
    return `-top-${halfSize} -right-${halfSize} w-${size} h-${size}`;
  }

  $: if (
    timelineScale &&
    timelineScale.domain() &&
    timelineScale.domain()[1] > 0
  ) {
    speechBubbleData = preprocessVerticalPositions(transcriptData);
    height = verticalPositions.length * speakerBandHeight;
  }

  $: yScaleSpeakers = scaleBand()
    .domain(speakers.sort((a, b) => a - b))
    .range([0, height])
    .padding(0.15);
</script>

{#if timelineScale}
  <div>
    <div class="relative" style="height: {height}px">
      {#each speechBubbleData.filter((d) => d.text_level1) as d}
        {#if d.text_level1 && d.start_sec >= timelineScale.domain()[0] && d.end_sec <= timelineScale.domain()[1]}
          <div
            class="absolute group bg-gray-200 text-xs leading-3 rounded hover:min-w-32 shadow-sm hover:shadow-md hover:z-50 transition-all ease-in-out"
            style="
              top: {d.yPos * speakerBandHeight}px;
              left: {timelineScale(d.start_sec,)}px;
              width: {timelineScale(d.end_sec) - timelineScale(d.start_sec)}px;
              color: {$speakerDarkColorScale(d.speaker,)}"
          >
            <div class="relative inline-block cursor-default" style="background: {$speakerColorScale(d.speaker)}20;">
              <img class="absolute opacity-50 pointer-events-none {getStressLevelClasses(d.stress_level)}" src="/img/stress{d.stress_level}.svg" alt="Stress level" />
              <div class="block group-hover:hidden">{d.text_level2}</div>
              <div class="hidden group-hover:block p-1">{d.text}</div>
            </div>
          </div>
        {/if}
      {/each}
    </div>
  </div>
{/if}
