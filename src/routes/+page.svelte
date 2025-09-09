<script>
  // Core Svelte lifecycle + microtask
  import { onMount, onDestroy, tick } from "svelte";

  // UI primitives
  import { Search, Modal } from "flowbite-svelte";

  // Data processing helpers for transforming CSV/JSON into view-ready structures
  import {
    preprocessTranscript,
    preprocessECG,
    preprocessVoiceMetrics,
    aggregateStressData,
  } from "$lib/dataProcessing";

  // App UI components
  import Header from "$lib/components/header/Header.svelte";
  import ConversationCascade from "$lib/components/ConversationCascade.svelte";
  import ConversationLog from "$lib/components/ConversationLog.svelte";
  import ConversationSummary from "$lib/components/ConversationSummary.svelte";
  import CommunicationTimeline from "$lib/components/communication-timeline/CommunicationTimeline.svelte";
  import RogerAudioPlayer from "$lib/components/roger-audio-player/RogerAudioPlayer.svelte";
  import SpeakersFilter from "$lib/components/header/SpeakersFilter.svelte";
  import ViewToggle from "$lib/components/header/ViewToggle.svelte";
  import { AudioPlayer } from "svelte-audio-player";

  // Speaker color stores
  import { speakerColorScale, speakerDarkColorScale } from "$lib/stores/speaker";

  // Global app state stores
  import {
    datasets,
    filteredData,
    aggregatedData,
    filterTimeRange,
    rogerMode,
    rogerStress,
    rogerRecording,
    filterSearchString,
    conversationPosition,
    radarData,
  } from "$lib/stores/app";

  // Vendor libs
  import * as d3 from "d3";
  import { scaleOrdinal } from "d3-scale";

  // External windows & helpers
  import VideoPlayerWindow from "$lib/components/VideoPlayerWindow.svelte";
  import { ComponentWindow } from "$lib/ComponentWindow.js";

  // Panels & utilities
  import ContextualConversationPanel from "$lib/components/contextual-conversation-panel/ContextualConversationPanel.svelte";
  import ResizeDivider from "$lib/components/rohams-suggestions/ResizeDivider.svelte";
  import TopicSpace from "$lib/components/rohams-suggestions/TopicSpace.svelte";

  // Toggle verbose console logs
  const debugMode = false;

  // ===== Local UI state =====
  let totalDuration = 0;        // total conversation duration (sec)
  let speakers = [];            // currently active speakers
  let allSpeakers = [];         // all detected speakers
  let data = [];                // raw transcript items

  let activeAudioSpeaker = "All"; // which audio track the player uses
  let binSize = 9;                 // timeline aggregation bin (sec)
  let audioPlayer;                 // ref to AudioPlayer
  let conversationLog;             // ref to ConversationLog
  let pageWidth = 800;             // viewport width for layout calcs
  let showVideo = false;           // whether the external video is open
  let showStress = true;           // toggle stress overlay on the timeline

  // Sidebar (right) sizing
  let sidebarWidth = 320;
  let isResizing = false;
  let container;                   // main container element

  // Begin horizontal resize (sidebar)
  function startResize() {
    isResizing = true;
    window.addEventListener('mousemove', resizeSidebar);
    window.addEventListener('mouseup', stopResize);
  }

  // Handle horizontal drag to resize sidebar
  function resizeSidebar(event) {
    if (!isResizing || !container) return;
    const containerLeft = container.getBoundingClientRect().left;
    const relativeX = event.clientX - containerLeft;
    sidebarWidth = Math.min(Math.max(310, pageWidth - relativeX), pageWidth - 200);
  }

  // Stop horizontal resize listeners
  function stopResize() {
    isResizing = false;
    window.removeEventListener('mousemove', resizeSidebar);
    window.removeEventListener('mouseup', stopResize);
  }

  // Bottom panel (cascade view) sizing
  let bottomPanelHeight = 240;
  let isVerticalResizing = false;
  let viewportHeight = 0;

  // Begin vertical resize (bottom panel)
  function startVerticalResize() {
    if (debugMode) console.log("🔧 Start vertical resize");
    isVerticalResizing = true;
    window.addEventListener('mousemove', resizeVerticalPanel);
    window.addEventListener('mouseup', stopVerticalResize);
  }

  // Handle vertical drag to resize bottom panel
  function resizeVerticalPanel(event) {
    if (!isVerticalResizing) return;
    const newHeight = Math.min(
      Math.max(160, viewportHeight - event.clientY),
      viewportHeight,
    );
    if (debugMode) console.log(`📐 Viewport: ${viewportHeight}, Y: ${event.clientY}, H: ${newHeight}`);
    bottomPanelHeight = newHeight;
  }

  // Stop vertical resize listeners
  function stopVerticalResize() {
    if (debugMode) console.log("✅ Stop vertical resize");
    isVerticalResizing = false;
    window.removeEventListener('mousemove', resizeVerticalPanel);
    window.removeEventListener('mouseup', stopVerticalResize);
  }

  // Track viewport height for vertical resizing
  onMount(() => {
    viewportHeight = window.innerHeight;
    const handleResize = () => (viewportHeight = window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });

  // ===== Data loading on mount =====
  onMount(async () => {
    // 1) Transcript (topics variant)
    const transcriptData = await d3.dsv(
      ",",
      `data/${$rogerRecording}/transcript_en_topics.csv`,
      d3.autoType,
    );
    ({ totalDuration, speakers, data } = preprocessTranscript(transcriptData));
    $datasets.transcript = data;

    // Speaker color palettes derived from unique speakers
    $speakerColorScale = scaleOrdinal()
      .range(["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f", "#e5c494"]) // light
      .domain(speakers);
    $speakerDarkColorScale = scaleOrdinal()
      .range(["#296653", "#A03003", "#334670", "#871C5E", "#52741A", "#B89600", "#D39C4A"]) // dark
      .domain(speakers);

    allSpeakers = structuredClone(speakers);

    // 2) ECG stress time series
    const ecgData = await d3.dsv(
      ",",
      `data/${$rogerRecording}/stress.csv`,
      d3.autoType,
    );
    $datasets.ecg = preprocessECG(ecgData);

    // 3) Voice metrics time series
    const voiceMetricsData = await d3.dsv(
      ";",
      `data/${$rogerRecording}/voice_metrics.csv`,
      d3.autoType,
    );
    $datasets.voiceMetrics = preprocessVoiceMetrics(voiceMetricsData);

    // 4) Event points & ranges
    const eventData = await fetch(`data/${$rogerRecording}/events.json`);
    $datasets.events = await eventData.json();
    const eventRangesData = await fetch(`data/${$rogerRecording}/event_ranges.json`);
    $datasets.eventRanges = await eventRangesData.json();

    // 5) Radar/traits per speaker
    const traitsData = await d3.csv(`data/${$rogerRecording}/radar_metrics.csv`, d3.autoType);
    const formatted = traitsData.map((d) => {
      const speaker_id = d.speaker;
      return {
        speaker_id,
        name: d.name,
        color: $speakerColorScale(speaker_id),
        clarity: +d.clarity,
        command: +d.command,
        information: +d.information,
        stress: +d.stress,
        speaking_share: +d.speaking_share,
        questions: +d.questions,
      };
    });
    radarData.set(formatted);
    $filteredData.radar = formatted;

    if (debugMode) {
      console.log('events', $datasets.events);
      console.log('eventRanges', $datasets.eventRanges);
    }
  });

  // Clean up external windows when navigating away
  onDestroy(() => {
    handleHideVideo();
  });

  // ===== Player & external window helpers =====
  // Seek the audio player to a speaker's segment when clicked
  async function handlePlaySpeaker(event) {
    const { speaker, start } = event.detail;
    activeAudioSpeaker = speaker;   // updates <AudioPlayer src>
    await tick();                   // ensure src is bound before seeking
    audioPlayer.seekOnly(start);    // perform seek without auto-play
  }

  // Manage popup window lifecycle for the video player
  let componentWindow = new ComponentWindow();
  let videoPlayerWindow;

  async function handleOpenVideo() {
    if (componentWindow.isOpened) {
      componentWindow.focus();
      return;
    }
    const newWindow = componentWindow.window;
    componentWindow.onWindowClose = handleHideVideo;
    videoPlayerWindow = await componentWindow.attachComponent(
      VideoPlayerWindow,
      { props: { videoOptions } },
      newWindow,
    );
    componentWindow.focus();
    showVideo = true;
  }

  function handleHideVideo() {
    componentWindow.destroy();
    videoPlayerWindow = null;
    showVideo = false;
  }

  // ===== Aggregations & derived data =====
  // Summarize transcript by speaker (speaking share & incomprehensible counts)
  function aggregateSpeakerData(transcriptData) {
    const aggregated = d3.rollup(
      transcriptData,
      (v) => ({
        speakingShare: d3.sum(v, (d) => d.duration),
        incomprehensible: d3.sum(v, (d) => (d.text.match(/\(unv\./g) || []).length),
      }),
      (d) => d.speaker,
    );

    const totalSpeakingShare = Array.from(aggregated.values()).reduce((acc, d) => acc + d.speakingShare, 0);
    const totalIncomprehensible = Array.from(aggregated.values()).reduce((acc, d) => acc + d.incomprehensible, 0);

    const data = [
      { dimension: "Speaking share", dimensionKey: "speakingShare" },
      { dimension: "Incomprehensible", dimensionKey: "incomprehensible" },
    ];

    for (const [speaker, { speakingShare, incomprehensible }] of aggregated) {
      data[0][speaker] = Math.round((speakingShare / totalSpeakingShare) * 100);
      data[1][speaker] = Math.round((incomprehensible / totalIncomprehensible) * 100);
    }

    // Placeholder (example dimension). Replace with real metric if needed.
    data.push({ dimension: "Questions", 1: 20, 2: 10, 3: 70 });
    return data;
  }

  // ===== Reactive derivations =====
  // Options for the external video selector
  $: videoOptions = [
    { name: "Bird's-eye", value: "overview" },
    ...speakers.map((speaker) => ({ name: speaker, value: speaker })),
  ];

  // Filter transcript & compute aggregates whenever inputs change
  $: if ($datasets.transcript) {
    $filteredData.transcript = $datasets.transcript.filter((d) => {
      let filter = true;
      if ($filterTimeRange) {
        filter = filter && d.start >= $filterTimeRange[0] && d.end <= $filterTimeRange[1];
      }
      if ($filterSearchString) {
        const q = $filterSearchString.toLowerCase();
        const haystack = (d.text_llm_en ?? "").toString().toLowerCase();
        filter = filter && haystack.includes(q);
      }
      if (speakers.length > 0) {
        filter = filter && speakers.includes(d.speaker);
      }
      if ($rogerStress.length < 4) {
        filter = filter && $rogerStress.includes(d.stress_level);
      }
      return filter;
    });

    $aggregatedData.speakers = aggregateSpeakerData($filteredData.transcript);

    // Keep radar metrics aligned with visible speakers
    $filteredData.radar = Array.isArray($radarData) && Array.isArray(speakers)
      ? $radarData.filter((d) => d && speakers.includes(d.speaker_id))
      : [];

    if (debugMode) {
      console.log("radarData:", $radarData);
      console.log("filteredData:", $filteredData);
    }
  }

  // Filter ECG by time and compute stress aggregation
  $: if ($datasets.ecg) {
    if ($filterTimeRange) {
      $filteredData.ecg = $datasets.ecg.filter(
        (d) => d.time >= $filterTimeRange[0] && d.time <= $filterTimeRange[1],
      );
    } else {
      $filteredData.ecg = $datasets.ecg;
    }
    $aggregatedData.stress = aggregateStressData($filteredData.ecg);
  }

  // Filter voice metrics by time
  $: if ($datasets.voiceMetrics) {
    if ($filterTimeRange) {
      $filteredData.voiceMetrics = $datasets.voiceMetrics.filter(
        (d) => d.time >= $filterTimeRange[0] && d.time <= $filterTimeRange[1],
      );
    } else {
      $filteredData.voiceMetrics = $datasets.voiceMetrics;
    }
  }

  // Compute container width for the timeline depending on layout
  $: timelineContainerWidth = $conversationPosition == 'right' ? pageWidth - sidebarWidth : pageWidth;

  // Filter events and ranges by time (if active)
  $: if ($datasets.events)
    $filteredData.events = $filterTimeRange
      ? $datasets?.events.filter((d) => d.time >= $filterTimeRange[0] && d.time <= $filterTimeRange[1])
      : $datasets.events;

  $: if ($datasets.eventRanges)
    $filteredData.eventRanges = $filterTimeRange
      ? $datasets.eventRanges.filter((d) => d.end >= $filterTimeRange[0] && d.start <= $filterTimeRange[1])
      : $datasets.eventRanges;

  // Debug helpers
  $: if (debugMode & $radarData?.length > 0) {
    console.log("📊 Loaded radarData:", $radarData);
    console.log("Agg Data:", $aggregatedData);
    console.log("datasets:", $datasets);
  }
</script>

<div class="h-screen flex flex-col">
  <!-- Header: audio controls and view toggle -->
  <Header>
    <div slot="center" class="flex items-center gap-6">
      <AudioPlayer src={`data/${$rogerRecording}/recording_${activeAudioSpeaker}.wav`}>
        <RogerAudioPlayer
          on:openVideo={handleOpenVideo}
          on:hideVideo={handleHideVideo}
          {activeAudioSpeaker}
          {speakers}
          bind:showVideo
          bind:this={audioPlayer}
        />
      </AudioPlayer>
    </div>
    <div slot="right">
      <ViewToggle />
    </div>
  </Header>

  <!-- Top controls: speaker filter + search -->
  <div class="flex gap-4 px-4 mt-2 mb-2 justify-between">
    <SpeakersFilter bind:speakers {allSpeakers} />
    <div></div>
    <div class="flex gap-x-12">
      <!-- Search across translated transcript text -->
      <Search
        class=" p-1.5 ps-9 sm:text-sm font-semibold focus:ring-gray-500 focus:border-gray-500"
        style="width: calc(20rem - 14px);"
        size="sm"
        bind:value={$filterSearchString}
      />
    </div>
  </div>

  <div class="flex flex-1 overflow-hidden" bind:clientWidth={pageWidth} bind:this={container}>
    <!-- Main content column -->
    <div class="flex-1 min-w-0">
      <!-- Communication timeline (with optional stress overlay) -->
      <CommunicationTimeline
              {binSize}
              {totalDuration}
              {speakers}
              {showStress}
              containerWidth={timelineContainerWidth}
      />
      <!-- Topic-space visualization -->
      {#if $rogerMode == "topic"}
        <TopicSpace/>
      {/if}
      <!-- Conversation summary view -->
      {#if $rogerMode == "summary"}
        <ConversationSummary {speakers} />
      {/if}
    </div>

    {#if $conversationPosition === 'right'}
      <!-- Sidebar resizer (right layout) -->
      <ResizeDivider
              direction="horizontal"
              onResizeStart={startResize}
              onResize={resizeSidebar}
              onResizeEnd={stopResize}
      />
      <!-- Resizable sidebar: conversation log -->
      <div
              class="overflow-y-auto flex-none"
              style="width: {sidebarWidth}px; min-width: 200px;"
      >
        {#if $filteredData?.transcript?.length > 0}
          <ConversationLog
                  data={$filteredData.transcript}
                  bind:this={conversationLog}
                  on:playSpeaker={handlePlaySpeaker}
          />
        {/if}
      </div>
    {/if}
  </div>
</div>

<ContextualConversationPanel />