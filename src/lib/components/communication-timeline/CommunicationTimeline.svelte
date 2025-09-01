<script>
  import StreamGraph from "./StreamGraph.svelte";
  import TimelineAxis from "./TimelineAxis.svelte";
  import GradientLanes from "./GradientLanes.svelte";
  import LineChart from "$lib/components/rohams-suggestions/LineChart.svelte";
  import EventSymbols from "./EventSymbols.svelte";
  import EventRanges from "$lib/components/rohams-suggestions/EventRanges.svelte";
  import SpeechBubbles from "./SpeechBubbles.svelte";
  import EventPrompts from "$lib/components/rohams-suggestions/EventPrompts.svelte";
  import { onMount, onDestroy } from "svelte";


  import { binHeatmapData, binTranscript } from "$lib/dataBinning";
  import { bin } from "d3";

  import {
    rogerMode,
    filteredData,
    rogerTime,
  } from "$lib/stores/app";

  export let totalDuration = 0;
  export let speakers = [];
  export let containerWidth = 800;
  export let binSize = 9;
  export let showStress = true;

  const debugMode = false;

  const margin = { top: 10, right: 20, bottom: 10, left: 24 };
  const brushHeight = 20;
  const axisHeight = 20;
  let streamgraphHeight = 200;
  let laneHeight = 80;
  let lineChartHeight = 140; // initial default; will be recomputed
  const laneGap = 30;
  let containerHeight = 0;

  let svg;
  let height;
  let timelineScale;
  let binnedTranscriptData = [];
  let binnedHeatmapData = [];
  let voiceMetricsKeys = [
    "voice_activation",
    "voice_dominance",
    "voice_valence",
    "voice_speaking_rate",
  ];

  $: timelineAxisHeight = brushHeight + axisHeight;
  $: width = containerWidth - margin.left - margin.right;
  $: lineChartVisible = $rogerMode == "flow" && showStress && binnedHeatmapData.length > 0;
  $: playheadX = margin.left + (timelineScale ? timelineScale($rogerTime || 0) : 0);
  $: playheadTop = margin.top + timelineAxisHeight; // start below brush + axis
  $: overlayHeight = $rogerMode === 'flow'
    ? (containerHeight - playheadTop) + lineChartHeight
    : (containerHeight - playheadTop); // make line longer in non-flow mode

  $: if (debugMode) {
    console.groupCollapsed("📏 Width Reactive Update");
    console.log("containerWidth:", containerWidth);
    console.log("margin.left + right:", margin.left + margin.right);
    console.log("→ computed width:", width);
    console.groupEnd();
  }

  // Measure available vertical space within this component
  let availableH = 0;
  let sizeObserver;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  function updateAvailableHeight() {
    availableH = containerEl ? containerEl.clientHeight : 0;
  }

// Allocate heights from the available space so StreamGraph, Speech lanes, and LineChart fit
$: {
    const baseAvail = Math.max(600, (availableH || 0) - margin.top - margin.bottom);
    if ($rogerMode === "flow") {
      const spare = Math.max(220, baseAvail - timelineAxisHeight);
      const targetStream = spare * 0.24;
      const targetLine   = spare * 0.24;
      streamgraphHeight = clamp(targetStream, 100, 200);
      lineChartHeight   = clamp(targetLine,   110, 220);
      const bands = Math.max(1, speakers.length);
      const lanesSpace = Math.max(80, spare - streamgraphHeight - lineChartHeight);
      laneHeight = Math.max(60, Math.floor((lanesSpace - laneGap * (bands - 1)) / bands));
      height = streamgraphHeight + timelineAxisHeight + (laneHeight * bands) + laneGap * (bands - 1);
    } else {
      streamgraphHeight = clamp(baseAvail - timelineAxisHeight, 90, 130);
      lineChartHeight = 0;
      laneHeight = 0;
      height = streamgraphHeight + timelineAxisHeight;
    }
    const bandsCount = Math.max(1, speakers.length);
    const coreHeight = $rogerMode === "flow"
      ? timelineAxisHeight + streamgraphHeight + (laneHeight * bandsCount) + laneGap * (bandsCount - 1)
      : timelineAxisHeight + streamgraphHeight;
    containerHeight = coreHeight + margin.top + margin.bottom;
  }

  $: if ($filteredData?.transcript?.length > 0) {
    binnedTranscriptData = binTranscript(binSize, speakers, $filteredData.transcript);

    if (debugMode) {
      console.log("📊 binnedTranscriptData updated", binnedTranscriptData);
    }
  }

  $: if ($filteredData.voiceMetrics?.length > 0 && $filteredData.ecg?.length > 0) {
    binnedHeatmapData = binHeatmapData(binSize, voiceMetricsKeys, $filteredData.voiceMetrics, $filteredData.ecg);

    if (debugMode) {
      console.log("🔥 binnedHeatmapData updated", binnedHeatmapData);
    }
  }


  let showPrompt = false;
  let promptTitle = "";
  let promptInitialData = null;
  let promptResolve;
  let containerEl;

  function isInBrushArea(event) {
    const svgRect = svg.getBoundingClientRect();
    const y = event.clientY - svgRect.top;
    return y <= brushHeight;
  }

  function openEventPrompt(title, initialData = null) {

    if (debugMode) console.log("📝 Opening event prompt:", title);

    return new Promise((resolve) => {
      promptTitle = title;
      showPrompt = true;
      promptResolve = resolve;
      promptInitialData = initialData;

    });
  }

  function handlePromptSubmit(e) {

    if (debugMode) console.log("✅ Prompt submitted:", e.detail);

    showPrompt = false;
    promptResolve(e.detail);
  }

  function handlePromptCancel() {

    if (debugMode) console.log("❌ Prompt canceled");

    showPrompt = false;
    promptResolve(null);
  }

  let contextMenu = {
    visible: false,
    x: 0,
    y: 0,
    eventData: null
  };

  function handleEventContextMenu(e) {
    const { clientX, clientY } = e.detail;
    const containerRect = containerEl.getBoundingClientRect();

    contextMenu = {
      visible: true,
      x: clientX - containerRect.left,
      y: clientY - containerRect.top,
      eventData: e.detail.event
    };
  }

  function closeContextMenu() {
    contextMenu.visible = false;
  }

  // 🟪 Drag to add range
  let isDragging = false;
  let dragStartX = null;
  let dragCurrentX = null;
  let suppressClick = false;

  function handleMouseDown(event) {
    if (event.button !== 0 || isInBrushArea(event)) return; // ✅ Only respond to left clicks

    const { left } = svg.getBoundingClientRect();
    dragStartX = event.clientX - left - margin.left;
    dragCurrentX = dragStartX;
    isDragging = true;
    suppressClick = false;

    if (debugMode) console.log("🟦 Mouse down, drag start:", dragStartX);
  }

  async function handleTimelineClick(event) {
    if (suppressClick || isInBrushArea(event)) return;

    const svgRect = svg.getBoundingClientRect();
    const x = event.clientX - svgRect.left - margin.left;
    const time = timelineScale.invert(x);
    const title = `Add Event at ${time.toFixed(1)}s`;

    if (debugMode) console.log("🟧 Click at", x, `→ time ${time.toFixed(2)}s`);

    const result = await openEventPrompt(title);
    if (!result) return;

    const newEvent = {
      time: +time.toFixed(2),
      description: result.description,
      color: result.color
    };

    $filteredData.events = [...($filteredData.events || []), newEvent];

    if (debugMode) console.log("📌 New event added", newEvent);

  }

  function handleMouseMove(event) {
    if (!isDragging) return;
    const { left } = svg.getBoundingClientRect();
    dragCurrentX = event.clientX - left - margin.left;
    if (Math.abs(dragCurrentX - dragStartX) > 3) {
      suppressClick = true; // trigger suppression
    }

    if (debugMode) console.log("🖱️ Mouse move", dragCurrentX);

  }

  async function handleMouseUp(event) {
    if (!isDragging) return;
    isDragging = false;

    if (!suppressClick) return;

    const startX = Math.min(dragStartX, dragCurrentX);
    const endX = Math.max(dragStartX, dragCurrentX);
    const startTime = timelineScale.invert(startX);
    const endTime = timelineScale.invert(endX);
    if (Math.abs(endTime - startTime) < 1) return;

    if (debugMode) console.log("🔲 Range drag:", { startTime, endTime });

    const title = `Describe range from ${startTime.toFixed(1)}s to ${endTime.toFixed(1)}s`;
    const result = await openEventPrompt(title);
    if (!result) return;

    const newRange = {
      start: +startTime.toFixed(2),
      end: +endTime.toFixed(2),
      description: result.description,
      color: result.color
    };

    $filteredData.eventRanges = [...($filteredData.eventRanges || []), newRange];

    if (debugMode) console.log("🆕 New range added:", newRange);

    setTimeout(() => {
      suppressClick = false;
    }, 0);
  }

  function handleRangeContextMenu(e) {
    const { clientX, clientY } = e.detail;
    const containerRect = containerEl.getBoundingClientRect();

    contextMenu = {
      visible: true,
      x: clientX - containerRect.left,
      y: clientY - containerRect.top,
      eventData: e.detail.event,
      isRange: true // ✅ distinguish from event symbols
    };
  }

  function deleteRange(rangeToDelete) {
    $filteredData.eventRanges = $filteredData.eventRanges.filter(r => r !== rangeToDelete);
    closeContextMenu();
  }

  async function editRange(rangeToEdit) {
    closeContextMenu();
    const title = `Edit Range: ${rangeToEdit.start.toFixed(1)}s → ${rangeToEdit.end.toFixed(1)}s`;
    const result = await openEventPrompt(title, rangeToEdit);
    if (!result) return;

    const updatedRange = {
      ...rangeToEdit,
      start: result.start != null ? +result.start.toFixed(2) : rangeToEdit.start,
      end: result.end != null ? +result.end.toFixed(2) : rangeToEdit.end,
      description: result.description,
      color: result.color
    };

    $filteredData.eventRanges = $filteredData.eventRanges.map(r => r === rangeToEdit ? updatedRange : r);
  }

  function handleGlobalKeydown(e) {
    if (e.key === "Escape") closeContextMenu();
  }

  function handleGlobalClick(e) {
    if (contextMenu.visible) closeContextMenu();
  }

  onMount(() => {
    if (typeof document !== 'undefined') {
      document.addEventListener("keydown", handleGlobalKeydown);
      document.addEventListener("click", handleGlobalClick);
    }

    if (typeof ResizeObserver !== 'undefined') {
      sizeObserver = new ResizeObserver(() => updateAvailableHeight());
      if (containerEl) sizeObserver.observe(containerEl);
      updateAvailableHeight();
    }

    if (debugMode) {
      console.groupCollapsed("📐 Initial Layout Debug (onMount)");
      console.log("containerEl.clientWidth:", containerEl?.clientWidth);
      console.log("svg.clientWidth:", svg?.clientWidth);
      console.groupEnd();
    }
  });

  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.removeEventListener("keydown", handleGlobalKeydown);
      document.removeEventListener("click", handleGlobalClick);
    }
    if (sizeObserver) {
      sizeObserver.disconnect();
      sizeObserver = null;
    }
  });

  function deleteEvent(eventToDelete) {
    $filteredData.events = $filteredData.events.filter(e => e !== eventToDelete);
    closeContextMenu();
  }

  async function editEvent(eventToEdit) {
    closeContextMenu();
    const title = `Edit Event at ${eventToEdit.time.toFixed(1)}s`;
    const result = await openEventPrompt(title, eventToEdit);
    if (!result) return;

    const updatedEvent = {
      ...eventToEdit,
      time: result.time != null ? +result.time.toFixed(2) : eventToEdit.time,
      description: result.description,
      color: result.color
    };

    $filteredData.events = $filteredData.events.map(e => e === eventToEdit ? updatedEvent : e);
  }
</script>

<div class="relative" bind:this={containerEl}>

  <svg
          height={$rogerMode==='flow'?containerHeight:containerHeight}
          width={containerWidth}
          bind:this={svg}
          on:click={handleTimelineClick}
          on:mousedown={handleMouseDown}
          on:mousemove={handleMouseMove}
          on:mouseup={handleMouseUp}
  >
    <g transform="translate({margin.left},{margin.top})">
      {#if $rogerMode == "flow" && showStress}
        <GradientLanes transform={`translate(0, ${timelineAxisHeight + streamgraphHeight})`} data={binnedHeatmapData} {timelineScale} {laneHeight} {laneGap} />
      {/if}
      <TimelineAxis
        bind:axisScale={timelineScale}
        {totalDuration}
        {width}
        height={$rogerMode==='flow'?height:height - 150}
        {brushHeight}
      />

      {#if isDragging}
        <rect
                x={Math.min(dragStartX, dragCurrentX)}
                y={10}
                width={Math.abs(dragCurrentX - dragStartX)}
                height={$rogerMode==='flow'?height:height - 100 - 20}
                fill="indigo"
                opacity="0.2"
                pointer-events="none"
        />
      {/if}

      <EventRanges
              {timelineScale}
              yOffset={timelineAxisHeight + 15}
              eventRanges={$filteredData.eventRanges}
              on:contextmenu={handleRangeContextMenu}
      />
      <EventSymbols
              {timelineScale}
              yOffset={timelineAxisHeight + 15}
              events={$filteredData.events}
              on:contextmenu={handleEventContextMenu}
      />

      {#if binnedTranscriptData.length > 0}
        <StreamGraph
          {totalDuration}
          binnedData={binnedTranscriptData}
          {speakers}
          {width}
          height={streamgraphHeight}
          transform={`translate(0, ${timelineAxisHeight})`}
        />
      {/if}
    </g>
  </svg>

  {#if $rogerMode == "flow" && speakers.length > 0 && $filteredData?.transcript?.length > 0}
    <div class="absolute" style="left: {margin.left}px; top: {margin.top + timelineAxisHeight + streamgraphHeight}px;">
      <SpeechBubbles {speakers} {timelineScale} {laneHeight} {laneGap} />
    </div>
  {/if}

  <!-- Line chart rendered below chat bubbles -->
  {#if $rogerMode == "flow" && showStress && binnedHeatmapData.length > 0}
    <LineChart
            speakers={speakers}
            data={binnedHeatmapData.flatMap(d => d.bins.map(b => ({ ...b, speaker: d.speaker })))}
            {timelineScale}
            width={width}
            height={lineChartHeight}
            totalDuration={totalDuration}
            currentTime={$rogerTime}
    />
  {/if}

  {#if timelineScale}
    <div
      class="absolute pointer-events-none z-20"
      style="left: {playheadX}px; top: {playheadTop}px; height: {overlayHeight}px; width: 0; border-left: 1px dashed #bdbdbd;"
    />
  {/if}

  {#if showPrompt}
    <EventPrompts
            title={promptTitle}
            initialData={promptInitialData}
            on:submit={handlePromptSubmit}
            on:cancel={handlePromptCancel}
    />
  {/if}

  {#if contextMenu.visible}
    <div class="absolute bg-white shadow-md border rounded z-50"
         style="top: {contextMenu.y}px; left: {contextMenu.x}px;"
         on:click|stopPropagation>
      <button class="block px-4 py-2 text-left hover:bg-gray-100 w-full"
              on:click={() => contextMenu.isRange
              ? editRange(contextMenu.eventData)
              : editEvent(contextMenu.eventData)}>Edit</button>
      <button class="block px-4 py-2 text-left hover:bg-gray-100 w-full text-red-600"
              on:click={() => contextMenu.isRange
              ? deleteRange(contextMenu.eventData)
              : deleteEvent(contextMenu.eventData)}>Delete</button>
    </div>
  {/if}
</div>
