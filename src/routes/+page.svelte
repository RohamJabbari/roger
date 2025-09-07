<script>
  import { onMount, onDestroy, tick } from "svelte";
  import { Search, Modal } from "flowbite-svelte";
  import {
      preprocessTranscript,
      preprocessECG,
      preprocessVoiceMetrics,
      aggregateStressData,
      topicList
  } from "$lib/dataProcessing";
  import Header from "$lib/components/header/Header.svelte";
  import ConversationCascade from "$lib/components/ConversationCascade.svelte";
  import ConversationLog from "$lib/components/ConversationLog.svelte";
  import ConversationSummary from "$lib/components/ConversationSummary.svelte";
  import CommunicationTimeline from "$lib/components/communication-timeline/CommunicationTimeline.svelte";
  import RogerAudioPlayer from "$lib/components/roger-audio-player/RogerAudioPlayer.svelte";
  import SpeakersFilter from "$lib/components/header/SpeakersFilter.svelte";
  import ViewToggle from "$lib/components/header/ViewToggle.svelte";
// import StressLevelInput from "$lib/components/header/StressLevelInput.svelte";
  import { AudioPlayer } from "svelte-audio-player";
  import {
    speakerColorScale,
    speakerDarkColorScale,
  } from "$lib/stores/speaker";
  import {
    datasets,
    filteredData,
    aggregatedData,
    filterTimeRange,
    rogerMode,
    rogerStress,
    rogerRecording,
    filterSearchString,
    conversationPosition, radarData,
  } from "$lib/stores/app";

  import * as d3 from "d3";
  import { scaleOrdinal } from "d3-scale";

  import VideoPlayerWindow from "$lib/components/VideoPlayerWindow.svelte";
  import { ComponentWindow } from "$lib/ComponentWindow.js";


  import ContextualConversationPanel from "$lib/components/contextual-conversation-panel/ContextualConversationPanel.svelte";
  import SamGlyphChart from "../lib/components/SamGlyphChart.svelte";
  import ResizeDivider from "$lib/components/rohams-suggestions/ResizeDivider.svelte";

  import TopicSpace from "$lib/components/rohams-suggestions/TopicSpace.svelte";

  const debugMode = false;

  let totalDuration = 0;
  let speakers = [];
  let allSpeakers = [];
  let data = [];

  let activeAudioSpeaker = "All";
  let binSize = 9;
  let audioPlayer;
  let conversationLog;
  let pageWidth = 800;
  let showVideo = false;
  let showStress = true;

  let sidebarWidth = 320; // default width in pixels
  let isResizing = false;

  function startResize() {
    isResizing = true;
    window.addEventListener('mousemove', resizeSidebar);
    window.addEventListener('mouseup', stopResize);
  }

  let container;

  function resizeSidebar(event) {
    if (!isResizing || !container) return;

    // Get X position relative to the container
    const containerLeft = container.getBoundingClientRect().left;
    const relativeX = event.clientX - containerLeft;

    sidebarWidth = Math.min(Math.max(310, pageWidth - relativeX), pageWidth - 200);
  }

  function stopResize() {
    isResizing = false;
    window.removeEventListener('mousemove', resizeSidebar);
    window.removeEventListener('mouseup', stopResize);
  }

  let bottomPanelHeight = 240; // Default height
  let isVerticalResizing = false;
  // let viewportHeight = window.innerHeight;

  function startVerticalResize() {
    if (debugMode) console.log("🔧 Start vertical resize");
    isVerticalResizing = true;
    window.addEventListener('mousemove', resizeVerticalPanel);
    window.addEventListener('mouseup', stopVerticalResize);
  }

  function resizeVerticalPanel(event) {
    if (!isVerticalResizing) return;

    const newHeight = Math.min(
            Math.max(160, viewportHeight - event.clientY),
            viewportHeight // optional max
    );

    if (debugMode) console.log(
            `📐 Viewport Height: ${viewportHeight}, Mouse Y: ${event.clientY}, New Height: ${newHeight}`
    );

    bottomPanelHeight = newHeight;
  }

  function stopVerticalResize() {
    if (debugMode) console.log("✅ Stop vertical resize");
    isVerticalResizing = false;
    window.removeEventListener('mousemove', resizeVerticalPanel);
    window.removeEventListener('mouseup', stopVerticalResize);
  }

  let viewportHeight = 0;

  onMount(() => {
    viewportHeight = window.innerHeight;
    const handleResize = () => viewportHeight = window.innerHeight;
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });

  onMount(async () => {
    const transcriptData = await d3.dsv(
      ",",
      // "data/" + $rogerRecording + "/transcript_en.csv",
      "data/" + $rogerRecording + "/transcript_en_topics.csv",
      d3.autoType,
    );
    ({ totalDuration, speakers, data } = preprocessTranscript(transcriptData));
    $datasets.transcript = data;

    $speakerColorScale = scaleOrdinal()
      .range([
        "#66c2a5",
        "#fc8d62",
        "#8da0cb",
        "#e78ac3",
        "#a6d854",
        "#ffd92f",
        "#e5c494",
      ])
      .domain(speakers);

    $speakerDarkColorScale = scaleOrdinal()
      .range([
        "#296653",
        "#A03003",
        "#334670",
        "#871C5E",
        "#52741A",
        "#B89600",
        "#D39C4A",
      ])
      .domain(speakers);

    allSpeakers = structuredClone(speakers);

    console.log("speakers: " + speakers)
    console.log("✅ allSpeakers updated:", allSpeakers);

    const ecgData = await d3.dsv(
      ",",
      "data/" + $rogerRecording + "/stress.csv",
      d3.autoType,
    );
    $datasets.ecg = preprocessECG(ecgData);

    const voiceMetricsData = await d3.dsv(
      ";",
      "data/" + $rogerRecording + "/voice_metrics.csv",
      d3.autoType,
    );
    $datasets.voiceMetrics = preprocessVoiceMetrics(voiceMetricsData);

    const eventData = await fetch('data/' + $rogerRecording + '/events.json');
    $datasets.events = await eventData.json();
    const eventRangesData = await fetch('data/' + $rogerRecording + '/event_ranges.json');
    $datasets.eventRanges = await eventRangesData.json();

    const traitsData = await d3.csv(`data/${$rogerRecording}/radar_metrics.csv`, d3.autoType);

    // Ensure 'Speaker' column is converted to string or name mapping
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
        questions: +d.questions
      };
    });

    radarData.set(formatted);
    $filteredData.radar = formatted;

    if (debugMode) {
      console.log('check events data', $datasets.events);
      console.log('check eventRanges data', $datasets.eventRanges);
    }

  });

  onDestroy(() => {
    handleHideVideo();
  });

  async function handlePlaySpeaker(event) {
    const { speaker, start } = event.detail;

    // 1) change source by switching active speaker (this updates <AudioPlayer src=...>)
    activeAudioSpeaker = speaker;

    // 2) wait a microtask so Svelte propagates the new src into <AudioPlayer>
    await tick();

    // 3) now perform a seek that waits for metadata if needed (no autoplay)
    audioPlayer.seekOnly(start);
  }

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
      {
        props: {
          videoOptions,
        },
      },
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

  function aggregateSpeakerData(transcriptData) {
    const aggregatedData = d3.rollup(
      transcriptData,
      (v) => ({
        speakingShare: d3.sum(v, (d) => d.duration),
        incomprehensible: d3.sum(
          v,
          (d) => (d.text.match(/\(unv\./g) || []).length,
        ),
      }),
      (d) => d.speaker,
    );
    const totalSpeakingShare = Array.from(aggregatedData.values()).reduce(
      (acc, d) => acc + d.speakingShare,
      0,
    );
    const totalIncomprehensible = Array.from(aggregatedData.values()).reduce(
      (acc, d) => acc + d.incomprehensible,
      0,
    );
    const data = [
      { dimension: "Speaking share", dimensionKey: "speakingShare" },
      { dimension: "Incomprehensible", dimensionKey: "incomprehensible" },
    ];

    for (const [
      speaker,
      { speakingShare: speakingShare, incomprehensible },
    ] of aggregatedData) {
      data[0][speaker] = Math.round((speakingShare / totalSpeakingShare) * 100);
      data[1][speaker] = Math.round(
        (incomprehensible / totalIncomprehensible) * 100,
      );
    }
    data.push({ dimension: "Questions", 1: 20, 2: 10, 3: 70 });
    return data;
  }

  $: videoOptions = [
    { name: "Bird's-eye", value: "overview" },
    ...speakers.map((speaker) => ({ name: speaker, value: speaker })),
  ];

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

    $filteredData.radar = Array.isArray($radarData) && Array.isArray(speakers)
      ? $radarData.filter((d) => d && speakers.includes(d.speaker_id))
      : [];

    console.log("radarData: " , $radarData);
    console.log("---------");
    console.log("filteredData: " , $filteredData);
  }


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

  $: if ($datasets.voiceMetrics) {
    if ($filterTimeRange) {
      $filteredData.voiceMetrics = $datasets.voiceMetrics.filter(
        (d) => d.time >= $filterTimeRange[0] && d.time <= $filterTimeRange[1],
      );
    } else {
      $filteredData.voiceMetrics = $datasets.voiceMetrics;
    }
  }

  $: timelineContainerWidth = $conversationPosition == 'right' ? pageWidth - sidebarWidth : pageWidth;

  $: if ($datasets.events) $filteredData.events = $filterTimeRange
    ? $datasets?.events.filter(
        (d) => d.time >= $filterTimeRange[0] && d.time <= $filterTimeRange[1],
      )
    : $datasets.events;

  $: if ($datasets.eventRanges) $filteredData.eventRanges = $filterTimeRange
          ? $datasets.eventRanges.filter(
                  (d) => d.end >= $filterTimeRange[0] && d.start <= $filterTimeRange[1]
          )
          : $datasets.eventRanges;

  $: if (debugMode & $radarData?.length > 0) {
    console.log("📊 Loaded radarData: ", $radarData);
    console.log("Agg Data: ", $aggregatedData);
    console.log("datasets: ", $datasets)
  }
</script>

<div class="h-screen flex flex-col">
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

  <div class="flex gap-4 px-4 mt-2 mb-2 justify-between">
    <SpeakersFilter bind:speakers {allSpeakers} />
    <div>

    </div>
    <div class="flex gap-x-12">
      <!--      <BinSizeInput bind:binSize />-->
      <!-- <StressLevelInput bind:showStress /> -->
      <!--      <EmotionsInput />-->
      <Search
        class=" p-1.5 ps-9 sm:text-sm font-semibold focus:ring-gray-500 focus:border-gray-500"
        style="width: calc(20rem - 14px);"
        size="sm"
        bind:value={$filterSearchString}
      />
    </div>
  </div>

  <div class="flex flex-1 overflow-hidden" bind:clientWidth={pageWidth} bind:this={container}>
    <!-- Left panel -->

    <div class="flex-1 min-w-0">
      <!--{#if $rogerMode != "topic" }-->
      <CommunicationTimeline
              {binSize}
              {totalDuration}
              {speakers}
              {showStress}
              containerWidth={timelineContainerWidth}
      />
      <!--{/if}-->
      {#if $rogerMode == "topic"}
        <TopicSpace
                topics={topicList}
                {speakers}
                data={$filteredData?.transcript}
        />
      {/if}
      {#if $rogerMode == "summary"}
        <ConversationSummary {speakers} />
      {/if}

    </div>

    <!-- Resize handle -->
    {#if $conversationPosition === 'right'}
      <!-- Horizontal Sidebar Divider -->
      <ResizeDivider
              direction="horizontal"
              onResizeStart={startResize}
              onResize={resizeSidebar}
              onResizeEnd={stopResize}
      />

    <!-- Resizable sidebar -->

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
  {#if $conversationPosition == 'bottom'}
    <!-- Vertical Bottom Divider -->
    <ResizeDivider
            direction="vertical"
            onResizeStart={startVerticalResize}
            onResize={resizeVerticalPanel}
            onResizeEnd={stopVerticalResize}
    />

    <div class="flex overflow-auto" style="height: {bottomPanelHeight}px; box-shadow: 0px 0px 12px 0px rgba(0,0,0,0.2);">
      {#if $filteredData?.transcript?.length > 0}
        <ConversationCascade
                {speakers}
                data={$filteredData.transcript}
                bind:this={conversationLog}
                on:playSpeaker={handlePlaySpeaker}
        />
      {/if}
    </div>
  {/if}
</div>
<!-- {#if $filteredData?.transcript?.length > 0}
  <SamGlyphChart message={$filteredData.transcript[0]} />
{/if} -->
<!--<div class="fixed bottom-3 right-4">-->
<!--  <ConversationPosToggle />-->
<!--</div>-->


<ContextualConversationPanel />