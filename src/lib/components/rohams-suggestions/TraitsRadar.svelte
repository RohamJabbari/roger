<script>
    import { filteredData, traitKeys } from "$lib/stores/app.js";
    import { speakerColorScale } from "$lib/stores/speaker.js";
    import { onMount, onDestroy } from "svelte";
    import * as d3 from "d3";

    let container;
    let maxRadarSize = 450;
    let width = 0;
    let height = 0;
    let radius = 0;

    let traits = [];
    let processed = [];
    let traitRanges = {};
    let tooltip;
    let legendItems = [];
    let showLegend = false;

    let resizeObserver;

    // Compute min-max per trait for normalization
    function computeTraitRanges(data, keys) {
        const ranges = {};
        keys.forEach(key => {
            const values = data.map(d => d[key]).filter(v => typeof v === "number");
            const min = d3.min(values);
            const max = d3.max(values);
            ranges[key] = { min, max };
        });
        return ranges;
    }

    // Reactive transformationd
    $: if ( $filteredData.radar?.length && $traitKeys?.length) {
        console.groupCollapsed("🧪 Debug: Radar Trait Processing");

        traitRanges = computeTraitRanges($filteredData.radar, $traitKeys);
        console.log("📈 Trait Ranges:", traitRanges);

        processed = $filteredData.radar.map(entry => {
            const values = {};
            $traitKeys.forEach(key => {
                const { min, max } = traitRanges[key];
                const raw = entry[key];
                const alreadyNormalized = min >= 0 && max <= 1;
                values[key] = {
                    raw,
                    norm: alreadyNormalized ? raw : max !== min ? (raw - min) / (max - min) : 0.5
                };
                console.log(`🔎 ${entry.name} – ${key}: raw=${raw}, norm=${values[key].norm}, range=[${min}, ${max}]`);
            });
            return {
                speaker_id: entry.speaker_id,
                name: entry.name,
                values
            };
        });

        traits = $traitKeys;
        legendItems = processed.map(d => ({ name: d.name, color: $speakerColorScale(d.speaker_id) }));
        console.log("🎯 Processed:", processed);
        console.log("🧬 Traits:", traits);
        console.groupEnd();
    }

    // Redraw chart
    $: if (processed.length && container) {
        drawRadarChart();
    }

    onMount(() => {
        resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                const rect = entry.contentRect;
                width = rect.width;
                height = rect.width; // Keep square
                radius = Math.min(width, height) / 2 - 40;
                drawRadarChart();
            }
        });
        if (container) resizeObserver.observe(container);
        console.log("🔍 container:", container);
    });

    onDestroy(() => {
        if (resizeObserver && container) {
            resizeObserver.unobserve(container);
        }
    });

    function drawRadarChart() {
        if (!container) return;

        const svg = d3.select(container)
            .html("")
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("preserveAspectRatio", "xMidYMid meet");

        const g = svg.append("g")
            .attr("transform", `translate(${width / 2}, ${height / 2})`);

        const angleSlice = (Math.PI * 2) / traits.length;
        const rScale = d3.scaleLinear().domain([0, 1]).range([0, radius]);

        // Draw background polygon instead of circle
        const backgroundPoints = traits.map((_, i) => {
            const angle = (Math.PI * 2 * i) / traits.length - Math.PI / 2;
            return [
                rScale(1) * Math.cos(angle),
                rScale(1) * Math.sin(angle)
            ];
        });

        g.append("polygon")
            .attr("points", backgroundPoints.map(p => p.join(",")).join(" "))
            .attr("fill", "none")
            .attr("stroke", "#ddd")
            .attr("stroke-width", 1);

        // Draw axes
        traits.forEach((trait, i) => {
            const angle = angleSlice * i - Math.PI / 2;
            const x = rScale(1) * Math.cos(angle);
            const y = rScale(1) * Math.sin(angle);

            g.append("line")
                .attr("x1", 0).attr("y1", 0)
                .attr("x2", x).attr("y2", y)
                .attr("stroke", "#ccc");

            g.append("text")
                .attr("x", x * 1.15)
                .attr("y", y * 1.15)
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "middle")
                .attr("font-size", "11px")
                .text(trait);
        });

        // Draw speaker polygons
        processed.forEach(({ speaker_id, name, values }) => {
            const line = d3.lineRadial()
                .radius((d, i) => {
                    const trait = traits[i];
                    const value = values[trait];
                    if (value && typeof value.norm === "number") {
                        return rScale(value.norm);
                    }
                    console.warn(`⚠️ Missing norm for trait '${trait}' in speaker '${name}'`);
                    return 0;
                })
                .angle((d, i) => i * angleSlice)
                .curve(d3.curveLinearClosed);

            g.append("path")
                .datum(traits)
                .attr("d", line)
                .attr("fill", $speakerColorScale(speaker_id))
                .attr("fill-opacity", 0.3)
                .attr("stroke", $speakerColorScale(speaker_id))
                .attr("stroke-width", 2);
        });

        const dotGroup = g.append("g").attr("class", "dots");

        // Tooltip points
        processed.forEach(({ speaker_id, name, values }) => {
            traits.forEach((trait, i) => {
                const angle = angleSlice * i - Math.PI / 2;
                const norm = values[trait]?.norm ?? 0;
                const raw = values[trait]?.raw;

                const x = rScale(norm) * Math.cos(angle);
                const y = rScale(norm) * Math.sin(angle);


                dotGroup.append("circle")
                    .attr("cx", x)
                    .attr("cy", y)
                    .attr("r", 4)
                    .attr("fill", $speakerColorScale(speaker_id))
                    .on("mouseover", () => {
                        tooltip.style.display = "block";

                        const showRaw = raw !== undefined && (raw < 0 || raw > 1 || traitRanges[trait].min < 0 || traitRanges[trait].max > 1);
                        tooltip.innerHTML = `
                          <div><strong>${name}</strong></div>
                          <div>Trait: <em>${trait}</em></div>
                          <div>Value: ${showRaw ? norm.toFixed(2) + ` (raw: ${raw})` : raw}</div>
                        `;
                    })
                    .on("mousemove", (event) => {
                        const tooltipRect = tooltip.getBoundingClientRect();
                        const padding = 10;

                        let left = event.clientX + padding;
                        let top = event.clientY + padding;

                        // Adjust if overflowing right
                        if (left + tooltipRect.width > window.innerWidth) {
                            left = event.clientX - tooltipRect.width - padding;
                        }

                        // Adjust if overflowing bottom
                        if (top + tooltipRect.height > window.innerHeight) {
                            top = event.clientY - tooltipRect.height - padding;
                        }

                        tooltip.style.left = `${left}px`;
                        tooltip.style.top = `${top}px`;
                    })
                    .on("mouseout", () => {
                        tooltip.style.display = "none";
                    });
            });
        });
    }
</script>

<style>
    .tooltip {
        position: fixed;
        background: white;
        padding: 0.5rem 0.75rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 0.875rem;
        color: #333;
        display: none;
        pointer-events: none;
        z-index: 999;
        white-space: nowrap;
        box-shadow: 0 2px 5px rgba(0,0,0,0.15);
    }
</style>

<div class="relative w-full h-full">
    <div bind:this={container} class="w-full aspect-square relative" style="max-width: {maxRadarSize}px; max-height: {maxRadarSize}px;"></div>
    <div bind:this={tooltip} class="tooltip"></div>

    {#if showLegend}
        <div class="mt-4 flex flex-wrap gap-4 text-sm font-medium">
            {#each legendItems as item}
                <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded-full" style="background-color: {item.color};"></div>
                    {item.name}
                </div>
            {/each}
        </div>
    {/if}
</div>