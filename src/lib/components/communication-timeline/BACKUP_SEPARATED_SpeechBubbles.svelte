<script>
  import { speakerColorScale } from "$lib/stores/speaker";
  import { scaleLinear, scaleBand } from 'd3-scale';
  import { filterTimeRange } from "$lib/stores/app";
  import { secondsToTime } from '$lib/utils';

  let speechBubbleData = [];
  let verticalPositions = {};
  let speakerPositions = {};
  let speakerBandHeight = 20;

  export let timelineScale;
  export let transcriptData = [];
  export let speakers = [];
  export let height = 400;

  function getTextWidth(text, font) {
    let canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    let context = canvas.getContext("2d");
    context.font = font;
    let metrics = context.measureText(text);
    return Math.round(metrics.width);
  }

  function preprocessVerticalPositions(data) {
    verticalPositions = {};
    speakers.forEach(speaker => verticalPositions[speaker] = []);

    data.forEach((d, index) => {
      if (!d.text_level1 || d.text_level1.length == 0) return;
      const textWidth = Math.min(80, getTextWidth(d.text_level1, 'bold 12pt arial'));
      d.x_pos_start = timelineScale(d.start_sec);
      d.x_pos_end = d.x_pos_start + textWidth;

      if (index == 0) {
        d.yPos = 0;
        verticalPositions[d.speaker][0] = d.x_pos_end;
      } else {
        let useExistingLevel = false;
        verticalPositions[d.speaker].forEach((pos, i) => {
          if (pos <= d.x_pos_start) {
            d.yPos = i;
            verticalPositions[d.speaker][i] = d.x_pos_end;
            useExistingLevel = true;
          }
        });

        if (!useExistingLevel) {
          d.yPos = verticalPositions[d.speaker].length;
          verticalPositions[d.speaker].push(d.x_pos_end);
        }
      }
    });

    return data;
  }

  $: if (timelineScale && timelineScale.domain() && timelineScale.domain()[1] > 0){
    speechBubbleData = preprocessVerticalPositions(transcriptData);
    
    speakerPositions = {};
    let runningTotal = 0;

    for (const key in verticalPositions) {
      speakerPositions[key] = runningTotal;
      runningTotal += verticalPositions[key].length * speakerBandHeight + 10;
    }

    height = runningTotal;
  }
  
  $: yScaleSpeakers = scaleBand()
      .domain(speakers.sort((a, b) => a - b))
      .range([0, height])
      .padding(0.15);
</script>

{#if timelineScale}
  <div class="border bg-white py-3">
    <div class=" relative" style="height: {height}px">
      {#each speakers as speaker, index}
        {#if index > 0}
          <div class="bg-slate-100 left-0 right-0 absolute" style="margin-top: {speakerPositions[speaker]}px; height: 1px"></div>
        {/if}
      {/each}
      {#each speechBubbleData.filter(d => d.text_level1) as d}
        {#if d.text_level1 && d.start_sec >= timelineScale.domain()[0] && d.end_sec <= timelineScale.domain()[1]}
          <div
            class="absolute bg-gray-200 text-xs leading-3 rounded"
            style="background: {$speakerColorScale(
              d.speaker,
            )}70; top: {(speakerPositions[d.speaker] + d.yPos*speakerBandHeight)}px; left: {timelineScale(
              d.start_sec,
            )}px; width: {timelineScale(d.end_sec) -
              timelineScale(d.start_sec)}px;"
          >
            {d.text_level1}
          </div>
        {/if}
      {/each}
    </div>
  </div>
{/if}