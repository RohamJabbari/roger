<script>
    import {onMount} from "svelte";

    export let topics = []; // e.g. ['Navigation', 'Threats', ...]
    export let speakers = [];  // Array of speaker objects with topic values
    export let data = [];

    import ParticipantMarker from "$lib/components/rohams-suggestions/ContoviParticipantMarker.svelte";
    import DonutChart from "$lib/components/rohams-suggestions/ContoviDonutChart.svelte";
    import Sedimentation from "$lib/components/rohams-suggestions/ContoviSedimentation.svelte";
    import { speakerColorScale } from "$lib/stores/speaker";

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

    $: grouped = Object.groupBy(data, d => d.speaker);

    $: dummyConversations = Object.entries(grouped)
        .filter(([_, entries]) => Array.isArray(entries))
        .map(([speakerId, entries], i) => {
            const utterances = topics.map(topic => ({
                topic,
                value: entries.reduce((sum, d) => sum + (d?.[topic] || 0), 0),
                time: i
            }));

            return {
                personId: entries[0]?.nameTag || `Speaker ${speakerId}`,
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

    function avg(arr) {
        return arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;
    }

    $: topicSums = topics.map(topic =>
        dummyConversations.reduce((sum, person) => {
            return sum + (person?.utterances?.find(u => u.topic === topic)?.value || 0);
        }, 0)
    );

    $: total = topicSums.reduce((a, b) => a + b, 0);

    const polarToCartesian = (cx, cy, r, angle) => {
        const rad = (angle - 90) * Math.PI / 180;
        return {
            x: cx + r * Math.cos(rad),
            y: cy + r * Math.sin(rad)
        };
    };

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
                {topics}
                {topicSums}
                {total}
                {centerX}
                {centerY}
                {outerRadius}
                {innerRadius}
                {polarToCartesian}

        />



<!--&lt;!&ndash;         Sedimentation belt&ndash;&gt;-->
<!--        <Sedimentation-->
<!--            {data}-->
<!--            {topics}-->
<!--            {topicSums}-->
<!--            {total}-->
<!--            {sedimentationOuterRadius}-->
<!--            {polarToCartesian}-->
<!--            {centerX}-->
<!--            {centerY}-->
<!--        />-->

        <!-- Participants -->
        {#each dummyConversations as person (person.personId)}
            {@const topicTotals = topics.map(cat =>
                person.utterances
                  .filter(u => u.topic === cat)
                  .reduce((acc, u) => acc + u.value, 0)
              )}
            {@const sumValues = topicTotals.reduce((a, b) => a + b, 0)}
            {@const topicCenterAngles = topics.map((_, i) => {
                const angle = (topicSums[i] / total) * 360;
                return topicSums.slice(0, i).reduce((a, b) => a + b, 0) / total * 360 + angle / 2;
            })}
            {@const weightedAngle = topicTotals.reduce((acc, val, i) => acc + (sumValues > 0 ? (val / sumValues) * topicCenterAngles[i] : 0), 0)}
            {@const normalizedWeight = sumValues > 0 ? sumValues / total : 0}
            {@const r = innerRadius * (0.5 + 0.5 * normalizedWeight)}
            {@const pos = polarToCartesian(centerX, centerY, r, weightedAngle)}

            <ParticipantMarker
                    person={person}
                    pos={pos}
                    topics={topics}
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