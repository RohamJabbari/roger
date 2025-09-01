<script>
    import { tooltip, rogerTime, filteredData } from "$lib/stores/app";
    import { createEventDispatcher } from "svelte";

    export let timelineScale;
    export let yOffset = 0;
    export let eventRanges;

    const dispatch = createEventDispatcher();

    const debugMode = false;

    $: if (debugMode) {
        console.groupCollapsed("🎯 EventRanges Debug Info");

        console.log("🧪 eventRanges:", eventRanges);
        console.log("📏 yOffset:", yOffset);

        if (timelineScale) {
            console.log("📐 timelineScale domain:", timelineScale.domain());
            console.log("📐 timelineScale range:", timelineScale.range());
        } else {
            console.log("⚠️ timelineScale not defined");
        }

        console.groupEnd();
    }

    function handleContextMenu(event, milestone) {
        event.preventDefault(); // prevent browser menu
        dispatch("contextmenu", {
            event: milestone,
            clientX: event.clientX,
            clientY: event.clientY
        });
    }

</script>

<g transform={`translate(0, ${yOffset})`}>
    {#each (eventRanges || []).filter(d => typeof d.start === 'number' && typeof d.end === 'number' && d.end > d.start) as range, i}
        <rect
                x={timelineScale(range.start)}
                width={timelineScale(range.end) - timelineScale(range.start)}
                y={-8}
                height={16}
                rx="3"
                fill={range.color || "indigo"}
                class="opacity-30 hover:opacity-70 cursor-pointer"
                on:mouseover={(event) => {
                    $tooltip = {
                      x: event.clientX + 4,
                      y: event.clientY + 4,
                      content: `${range.description}<br/><span style="opacity:0.7;">(${range.start}–${range.end}s)</span>`
                    };
                    }}
                            on:mouseleave={() => {
                    $tooltip = null;
                    }}
                            on:click|stopPropagation={() => {
                    $rogerTime = range.start;
                    }}
                            on:contextmenu={(e) => handleContextMenu(e, range)}
        />
    {/each}
</g>