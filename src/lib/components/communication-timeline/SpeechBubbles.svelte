<script>
  import { speakerColorScale, speakerDarkColorScale } from "$lib/stores/speaker";
  import { scaleBand } from "d3-scale";
  import { stressLevels } from "$lib/utils";
  import { rogerTime, rogerMotifs, rogerMotifsPresentation, filteredData } from "$lib/stores/app";

  let speechBubbleData = [];
  let verticalPositions = [];

  export let timelineScale;
  export let speakers = [];
  export let height = 400;
  export let laneHeight = 60;
  export let laneGap = 30;

  let maxTextWidth = 300;

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
    verticalPositions = {};
    speakers.forEach((speaker) => {
      verticalPositions[speaker] = { levels: [] };
    });

    let currentSpeaker = null;

    data.forEach((d, index) => {
      if (!d.text_level1 || d.text_level1.length == 0) return;
      const textWidth = Math.min(
        maxTextWidth,
        getTextWidth(d.text_clean, "bold 12pt arial"),
      );
      d.textWidth = textWidth;
      d.x_pos_start = timelineScale(d.start_sec);
      d.x_pos_end = d.x_pos_start + textWidth;

      if (index == 0 || d.speaker != currentSpeaker) {
        d.yPos = 0;
        verticalPositions[d.speaker].levels[0] = d.x_pos_end + 10;
        currentSpeaker = d.speaker;
      } else {
        let useExistingLevel = false;
        verticalPositions[d.speaker].levels.forEach((pos, i) => {
          if (pos <= d.x_pos_start && !useExistingLevel) {
            d.yPos = i;
            verticalPositions[d.speaker].levels[i] = d.x_pos_end + 10;
            useExistingLevel = true;
          }
        });

        if (!useExistingLevel) {
          d.yPos = verticalPositions[d.speaker].levels.length;
          verticalPositions[d.speaker].levels.push(d.x_pos_end + 10);
        }
      }
    });

    let currentY = 0;
    speakers.forEach((speaker, index) => {
      verticalPositions[speaker].height = laneHeight;
      // verticalPositions[speaker].height = verticalPositions[speaker].levels.length * laneHeight;
      if (index > 0) {
        verticalPositions[speaker].yOffset = currentY;
      } else {
        verticalPositions[speaker].yOffset = 0;
      }
      currentY += verticalPositions[speaker].height + laneGap;
    });

    height = currentY;

    return data;
  }

  function getStressLevelClasses(stress_level) {
    const size = stressLevels[stress_level].size;
    const halfSize = size / 2;
    return `-top-${halfSize} -right-${halfSize} w-${size} h-${size}`;
  }

  function getHighlightClasses(message) {
    if ($rogerMotifs?.length > 0 && $rogerMotifsPresentation === 'highlight') {
      return message.highlight === true ? 'ring-2 ring-gray-700' : 'opacity-40';
    }
    return '';
  }

  function getHighlightOpacity(message) {
    return message.highlight === true ? 0.7 : 0.4;
  }

  $: if (
    timelineScale &&
    timelineScale.domain() &&
    timelineScale.domain()[1] > 0
  ) {
    speechBubbleData = preprocessVerticalPositions($filteredData.transcript);
  }
</script>

{#if timelineScale}
  <div>
    <div class="relative" style="height: {height}px">
      {#if speechBubbleData && verticalPositions}
        {#each speechBubbleData as d}
          {#if d.start_sec >= timelineScale.domain()[0] && d.end_sec <= timelineScale.domain()[1]}

            <div
              class="absolute group text-xs leading-3 rounded shadow-md hover:shadow-lg hover:z-50 transition-all ease-in-out {getHighlightClasses(d)}"
              style="
                top: {verticalPositions[d.speaker].yOffset - 8}px;
                left: {timelineScale(d.start_sec,)}px;
                width: {Math.max(3,timelineScale(d.end_sec) - timelineScale(d.start_sec))}px;
                height: {verticalPositions[d.speaker].height}px;
                color: {$speakerDarkColorScale(d.speaker,)};
                background: {$speakerColorScale(d.speaker)};
                background-opacity: {$rogerMotifs?.length && $rogerMotifsPresentation === 'highlight' ? getHighlightOpacity(d) : 0.7};"
            >
              <!-- <img class="absolute left-0 opacity-50 pointer-events-none {getStressLevelClasses(d.stress_level)}" src="/img/stress{d.stress_level}.svg" alt="Stress level" /> -->
              <div class="relative inline-block cursor-default" style="top: {d.yPos * laneHeight}px; width:{d.textWidth}px">
                <div
                        class="absolute left-0 mt-1 z-50 text-[10px] max-w-xs bg-white border border-gray-300 rounded shadow-md px-2 py-1 hidden group-hover:block"
                        style="top: 100%; white-space: normal; min-width: 120px;"
                >
                  {d.text_clean}
                </div>
              </div>
            </div>
          {/if}
        {/each}
      {/if}
    </div>
  </div>
{/if}
