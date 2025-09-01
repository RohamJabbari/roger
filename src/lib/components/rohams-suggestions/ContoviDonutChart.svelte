<script>
    export let topics;
    export let topicSums;
    export let total;
    export let centerX = 0;
    export let centerY = 0;
    export let outerRadius;
    export let innerRadius;
    export let polarToCartesian;
    export let showLabels = true;

    let sectorData = [];

    $: {
        sectorData = [];
        let runningAngle = 0;
        topics.forEach((cat, i) => {
            const value = topicSums[i];
            if (value > 0) {
                const angle = (value / total) * 360;
                const startAngle = runningAngle;
                const endAngle = runningAngle + angle;
                const midAngle = (startAngle + endAngle) / 2;
                const donutEdge = polarToCartesian(centerX, centerY, outerRadius, midAngle);
                const labelPos = polarToCartesian(centerX, centerY, outerRadius + 40, midAngle);
                sectorData.push({ cat, i, startAngle, endAngle, midAngle, donutEdge, labelPos });
                runningAngle += angle;
            }
        });
    }

    const createArc = (startAngle, endAngle) => {
        const startOuter = polarToCartesian(centerX, centerY, outerRadius, endAngle);
        const endOuter = polarToCartesian(centerX, centerY, outerRadius, startAngle);
        const startInner = polarToCartesian(centerX, centerY, innerRadius, startAngle);
        const endInner = polarToCartesian(centerX, centerY, innerRadius, endAngle);
        const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

        return `
      M ${startOuter.x} ${startOuter.y}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 0 ${endOuter.x} ${endOuter.y}
      L ${startInner.x} ${startInner.y}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${endInner.x} ${endInner.y}
      Z
    `;
    };

    const topicColors = [
        "#a98467", // cocoa brown (replacing lavender gray)
        "#a1c181", // sage green
        "#f4a261", // desert orange
        "#729b79", // moss
        "#c9ada7", // dusty rose
        "#bc8a5f", // clay/terracotta (replacing desaturated blue)
        "#e0a899", // warm taupe
        "#cb997e", // sand
        "#b5b682", // olive-sage
        "#9e768f"  // mauve
    ];
</script>

<!-- Donut Arcs and Labels -->
{#each sectorData as { cat, i, startAngle, endAngle, donutEdge, labelPos } (cat)}
    <g>
        <path
                d={createArc(startAngle, endAngle)}
                fill={topicColors[ i % topicColors.length ]}
                stroke="#fff"
                stroke-width="2"
        />
        {#if showLabels}
            <line
                    x1={donutEdge.x}
                    y1={donutEdge.y}
                    x2={labelPos.x}
                    y2={labelPos.y}
                    stroke="#333"
                    stroke-width="1"
            />

            <text
                    x={labelPos.x}
                    y={labelPos.y}
                    font-size="14"
                    font-weight="bold"
                    text-anchor={labelPos.x < centerX ? 'end' : 'start'}
                    alignment-baseline="middle"
                    fill="#333"
            >
                {cat}
            </text>
        {/if}
    </g>
{/each}

<!-- Topic Center Lines -->
{#each sectorData as { midAngle } (midAngle)}
    {@const centerPoint = polarToCartesian(centerX, centerY, innerRadius, midAngle)}
    <line
            x1={centerX}
            y1={centerY}
            x2={centerPoint.x}
            y2={centerPoint.y}
            stroke="#aaa"
            stroke-dasharray="4"
            stroke-width="1"
    />
{/each}