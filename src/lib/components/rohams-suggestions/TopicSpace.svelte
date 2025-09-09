<script>
    import {onMount, onDestroy} from "svelte";

    // export let topics = []; // e.g. ['Navigation', 'Threats', ...]
    // export let speakers = [];  // Array of speaker objects with topic values
    // export let data = [];

    import ParticipantMarker from "$lib/components/rohams-suggestions/ContoviParticipantMarker.svelte";
    import DonutChart from "$lib/components/rohams-suggestions/ContoviDonutChart.svelte";
    import Sedimentation from "$lib/components/rohams-suggestions/ContoviSedimentation.svelte";
import { speakerColorScale } from "$lib/stores/speaker";

import {
    topicList,
} from "$lib/dataProcessing";

import {
    rogerTime,
    filteredData,
} from "$lib/stores/app";

// Debug: log topicList and filteredData.transcript whenever they change
$: console.log("[TopicSpace] topicList:", topicList);
$: console.log("[TopicSpace] filteredData.transcript:", $filteredData?.transcript);
$: currentSecond = Math.floor($rogerTime || 0);

let hoveredPerson = null;
    // const height = 700;
    // const width = 1200;
    let container;
    let width = 800;
    let height = 700;

    onMount(() => {
        if (container) {
            const bounds = container.getBoundingClientRect();
            width = bounds.width;
            height = Math.min(bounds.width * 0.6, 700); // aspect ratio or cap height
        }
    });

    onMount(() => {
        const resize = () => {
            const bounds = container?.getBoundingClientRect();
            if (bounds) {
                width = bounds.width;
                height = Math.min(window.innerHeight - 350, bounds.width * 0.6); // for example
            }
        };
        resize(); // initial call
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    });



    $: outerRadius = (height - 150) / 2;
    $: innerRadius = outerRadius - 20;
    $: sedimentationOuterRadius = innerRadius - 5;
    $: centerX = width / 2;
    $: centerY = height / 2;

    $: grouped = Object.groupBy($filteredData?.transcript ?? [], d => d.speaker);

    $: dummyConversations = Object.entries(grouped)
        .filter(([_, entries]) => Array.isArray(entries))
        .map(([speakerId, entries], i) => {
            const utterances = topicList.map(topic => ({
                topic,
                value: entries.reduce((sum, d) => sum + (d?.topicMemberships?.[topic] ?? 0), 0),
                time: i
            }));

            return {
                personId: entries[0]?.nameTag || `Speaker ${speakerId}`,
                speakerId: +speakerId,
                role: entries[0]?.nameTag?.includes('Officer') ? 'Officer' : 'Sergeant',
                color: $speakerColorScale ? $speakerColorScale(+speakerId) : 'gray',
                utterances,
                traits: {
                    stress: avg(entries.map(d => d.stress ?? 0)),
                    emotionLevel: avg(entries.map(d => d.arousal ?? 0)),
                    focus: avg(entries.map(d => d.valence ?? 0)),
                    alertness: 0.5,
                    confidence: 0.5
                }
            };
        });

// Per-speaker topic participation vector at the current second (from topicMemberships)
$: topicParticipationBySpeaker = (() => {
  const map = new Map();
  const t = Math.floor($rogerTime || 0);
  const groupedObj = grouped || {};
  for (const [sid, entries] of Object.entries(groupedObj)) {
    const active = (entries || []).filter(d => {
      const s = (d.start_sec ?? d.start ?? d.startTime ?? 0);
      const e = (d.end_sec ?? d.end ?? d.endTime ?? s);
      return s <= t && e >= t;
    });
    const vec = topicList.map(topic =>
      active.reduce((acc, d) => acc + (d.topicMemberships?.[topic] ?? 0), 0)
    );
    map.set(+sid, vec);
  }
  return map;
})();

    // Per-second console logging driven by playback time (no timers)
    let _lastLoggedSecond = -1;
    $: {
        const _t = Math.floor($rogerTime || 0);
        if (dummyConversations && dummyConversations.length && _t !== _lastLoggedSecond) {
            _lastLoggedSecond = _t;
            console.log(`[TopicSpace] t=${_t}s`);
            const lastPerson = dummyConversations[dummyConversations.length - 1];
            if (lastPerson) {
                const values = topicList.map(t =>
                    lastPerson.utterances
                        .filter(u => u.topic === t)
                        .reduce((acc, u) => acc + (u.value || 0), 0)
                );
                console.log(lastPerson.personId, values);
            }
        }
    }

    function avg(arr) {
        return arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;
    }

    $: topicSums = topicList.map(topic =>
      ($filteredData?.transcript ?? []).reduce((sum, d) => sum + (d?.topicMemberships?.[topic] ?? 0), 0)
    );
    $: console.log("[TopicSpace] topicSums:", topicSums);

    $: total = topicSums.reduce((a, b) => a + b, 0);

    const polarToCartesian = (cx, cy, r, angle) => {
        const rad = (angle - 90) * Math.PI / 180;
        return {
            x: cx + r * Math.cos(rad),
            y: cy + r * Math.sin(rad)
        };
    };

    $: console.log("[TopicSpace] topicSums:", topicSums);

</script>
<div bind:this={container} class="w-full overflow-auto">
    <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="xMidYMid meet"
            class="relative"
            style="background: transparent;"
    >
        <defs>
            <filter id="tooltipShadow" x="0" y="0" width="100%" height="100%">
                <feComponentTransfer in="SourceAlpha">
                    <feFuncA type="table" tableValues="1 0"/>
                </feComponentTransfer>
                <feGaussianBlur stdDeviation="2"/>
                <feOffset dx="0" dy="2"/>
                <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1"/>
                <feMerge>
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
            <linearGradient id="tooltipGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#fff" stop-opacity="1"/>
                <stop offset="100%" stop-color="#ddd" stop-opacity="1"/>
            </linearGradient>
        </defs>
        <!-- Precomputed donut arcs and labels -->
        <g transform="translate(0, -50)">
        <DonutChart
                topics={topicList}
                {topicSums}
                {total}
                {centerX}
                {centerY}
                {outerRadius}
                {innerRadius}
                {polarToCartesian}
                tooltip={true}

        />



<!--&lt;!&ndash;         Sedimentation belt&ndash;&gt;-->
<!--        <Sedimentation-->
<!--            {data}-->
<!--            {topics: topicList}-->
<!--            {topicSums}-->
<!--            {total}-->
<!--            {sedimentationOuterRadius}-->
<!--            {polarToCartesian}-->
<!--            {centerX}-->
<!--            {centerY}-->
<!--        />-->

        <!-- Participants -->
        {#each dummyConversations as person (person.personId)}
            {@const currentVec = topicParticipationBySpeaker.get(person.speakerId) || topicList.map(() => 0)}
            {@const sumValues = currentVec.reduce((a, b) => a + b, 0)}
            {@const topicCenterAngles = topicList.map((_, i) => {
                const angle = (topicSums[i] / total) * 360;
                return topicSums.slice(0, i).reduce((a, b) => a + b, 0) / total * 360 + angle / 2;
            })}
            {@const weightedAngle = currentVec.reduce((acc, val, i) => acc + (sumValues > 0 ? (val / sumValues) * topicCenterAngles[i] : 0), 0)}
            {@const normalizedWeight = sumValues > 0 ? sumValues / total : 0}
            {@const r = innerRadius * (0.5 + 0.5 * normalizedWeight)}
            {@const pos = polarToCartesian(centerX, centerY, r, weightedAngle)}

            <ParticipantMarker
                    person={person}
                    pos={pos}
                    topics={topicList}
                    topicParticipation={topicParticipationBySpeaker.get(person.speakerId) || topicList.map(() => 0)}
                    onHover={(p) => hoveredPerson = p}
                    onLeave={() => hoveredPerson = null}
                    {polarToCartesian}

            />
        {/each}
        </g>
    </svg>
</div>

<style>
    svg {
        width: 100%;
        height: auto;
    }
</style>