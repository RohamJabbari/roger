<script>
    import { scaleLinear, scaleTime, line, axisLeft, axisBottom, select } from "d3";
import { onMount, afterUpdate, onDestroy } from "svelte";
    import { speakerColorScale } from "$lib/stores/speaker.js";
    import { get } from "svelte/store";
import { curveMonotoneX } from "d3-shape";

    export let data = [];
    export let speakers = [];
    export let timelineScale;
    export let width = 800;
    export let height = 120;

    let svg;
    let container;
    let yScale;
    let xAxisGroup;
    let yAxisGroup;

    const margin = { top: 24, right: 18, bottom: 20, left: 25 };
    let containerWidth = width;
    let containerHeight = height;

// Observers and measurement helper to handle hidden -> visible transitions
let ro; // ResizeObserver
let io; // IntersectionObserver
function measureNow() {
    if (!container) return;
    const rect = container.getBoundingClientRect();
    if (rect.width > 0) containerWidth = rect.width;
    if (rect.height > 0) containerHeight = rect.height;
}

function handleVis() {
    if (document.visibilityState === 'visible') {
        requestAnimationFrame(measureNow);
    }
}
const handleResize = () => requestAnimationFrame(measureNow);
const handleOrient = () => requestAnimationFrame(measureNow);

    let tooltip = { visible: false, x: 0, y: 0, datum: null };
    let xScale; // local, per-chart scale derived from timelineScale

onMount(() => {
    // Initial measure (handles first visible render)
    measureNow();

    // ResizeObserver: track container resizes
    ro = new ResizeObserver(entries => {
        for (let entry of entries) {
            const { width: w, height: h } = entry.contentRect;
            if (w > 0) containerWidth = w;
            if (h > 0) containerHeight = h;
        }
    });
    if (container) ro.observe(container);

    // IntersectionObserver: re-measure when becoming visible (after tab switch)
    if (typeof IntersectionObserver !== 'undefined') {
        io = new IntersectionObserver((entries) => {
            const e = entries[0];
            if (e && e.isIntersecting) {
                requestAnimationFrame(measureNow);
            }
        }, { root: null, threshold: 0 });
        if (container) io.observe(container);
    }

    // Also handle browser tab visibility changes & orientation
    document.addEventListener('visibilitychange', handleVis);
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrient);
});

onDestroy(() => {
    if (ro) ro.disconnect();
    if (io) io.disconnect();
    document.removeEventListener('visibilitychange', handleVis);
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleOrient);
});

    $: plotWidth = containerWidth - margin.left - margin.right;
    $: plotHeight = containerHeight - margin.top - margin.bottom;

    $: xScale = timelineScale
      ? timelineScale.copy().range([0, plotWidth]).clamp(true)
      : null;

    $: allStressValues = data.map(d =>
        typeof d.stress === "number" ? d.stress :
            typeof d.stress_level === "number" ? d.stress_level : null
    ).filter(v => v !== null);

    $: maxY = allStressValues.length ? Math.max(...allStressValues) : 1;

    $: if (timelineScale && allStressValues.length) {
        yScale = scaleLinear()
            .domain([0, maxY])
            .range([plotHeight, 0]);
    }

    const getY = d =>
        typeof d.stress === "number" ? d.stress :
            typeof d.stress_level === "number" ? d.stress_level :
                0;

    const getLine = (speakerData, offset = 0) => {
        const clean = speakerData
            .filter(d => isFinite(d.start) && isFinite(getY(d)))
            .sort((a, b) => a.start - b.start);

        return line()
            .defined(d => isFinite(getY(d)))
            .x(d => xScale(d.start))
            .y(d => yScale(getY(d)) - offset)
            .curve(curveMonotoneX)(clean); // monotone in X to avoid overshoot on resize
    };

    function buildPath(speakerData, offset = 0) {
        if (!xScale || !yScale) return null;
        const clean = speakerData
            .filter(d => isFinite(d.start) && isFinite(getY(d)))
            .sort((a, b) => a.start - b.start);

        return line()
            .defined(d => isFinite(getY(d)))
            .x(d => xScale(d.start))
            .y(d => yScale(getY(d)) - offset)
            .curve(curveMonotoneX)(clean);
    }

    let paths = [];
    $: if (xScale && yScale && speakers?.length && data?.length) {
        paths = speakers.map((speaker, i) => {
            const id = speaker.id ?? speaker;
            const sd = data.filter(d => d.speaker == id);
            const safe = sd.filter(d =>
                isFinite(d.start) && (typeof d.stress === 'number' || typeof d.stress_level === 'number')
            );
            return safe.length > 1 ? buildPath(safe, i * 2) : null;
        });
    }

    let points = [];
    $: if (data.length && xScale && yScale) {
        points = speakers.flatMap((speaker, i) => {
            const speakerId = speaker.id ?? speaker;
            return data
                .filter(d => d.speaker == speakerId && isFinite(d.start) && isFinite(getY(d)))
                .map(d => ({
                    ...d,
                    x: xScale(d.start),
                    y: yScale(getY(d)) - i * 2,
                    color: get(speakerColorScale)(speakerId)
                }));
        });
    }

    // Draw axes reactively when scale or group changes
    $: if (xAxisGroup && xScale) {
        select(xAxisGroup)
            .call(axisBottom(xScale)
                .tickFormat(d => {
                    const minutes = Math.floor(d / 60);
                    const seconds = Math.floor(d % 60).toString().padStart(2, '0');
                    return `${minutes}:${seconds}`;
                })
                .ticks(5)
            );
    }

    $: if (yScale && yAxisGroup) {
        select(yAxisGroup)
            .call(axisLeft(yScale).ticks(4));
    }
</script>

<div bind:this={container} class="w-full h-full relative bg-transparent">
    <!-- Label -->
    <div class="absolute text-xs text-gray-700 top-1 left-2 z-10">Stress Level</div>

    <svg bind:this={svg} width={containerWidth} height={containerHeight}>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
            <!-- Y Axis -->
<!--            <g bind:this={yAxisGroup} class="text-xs" transform="translate(0,0)" />-->

            <!-- X Axis -->
            {#if xScale}
                {#key `${xScale.range()[0]}-${xScale.range()[1]}-${plotHeight}`}
                    <g bind:this={xAxisGroup} class="text-xs" transform={`translate(0, ${plotHeight})`} />
                {/key}
            {/if}

            <!-- Lines and Points -->
            {#if data.length && xScale && yScale}
                {#key xScale.range()[1]}
                    {#each speakers as speaker, i}
                        {#if paths[i]}
                            <path
                                d={paths[i]}
                                fill="none"
                                stroke={$speakerColorScale(speaker.id ?? speaker)}
                                stroke-width="7"
                                opacity={1 - i * 0.1}
                            />
                        {/if}
                    {/each}

                    {#each points as p}
                        <circle
                            cx={p.x}
                            cy={p.y}
                            r="3"
                            fill={p.color}
                            fill-opacity="0.6"
                            stroke="white"
                            stroke-width="1"
                            on:mouseenter={() => tooltip = { visible: true, x: p.x + margin.left, y: p.y + margin.top, datum: p }}
                            on:mouseleave={() => tooltip.visible = false}
                        />
                    {/each}
                {/key}
            {/if}
        </g>
    </svg>

    {#if tooltip.visible && tooltip.datum}
        <div
                class="absolute pointer-events-none z-10 text-xs bg-white border border-gray-300 shadow rounded px-3 py-2"
                style="left: {tooltip.x + 10}px; top: {tooltip.y + 10}px; font-size: 11px; line-height: 1.3;"
        >
            <div><strong>time:</strong> {tooltip.datum.start.toFixed(1)}s</div>
            <div><strong>speaker:</strong> {tooltip.datum.speaker}</div>
            <div><strong>stress:</strong> {(tooltip.datum.stress ?? tooltip.datum.stress_level)?.toFixed(3)}</div>
        </div>
    {/if}
</div>

<style>
    svg text {
        font-size: 10px;
        fill: #555;
    }

    .tick line {
        stroke: #ccc;
    }

    .domain {
        stroke: #aaa;
    }
</style>