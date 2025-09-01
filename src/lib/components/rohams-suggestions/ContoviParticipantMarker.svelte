<script>
    import Tooltip from "$lib/components/rohams-suggestions/ContoviTooltip.svelte";
    import DonutChart from "$lib/components/rohams-suggestions/ContoviDonutChart.svelte";

    export let person;
    export let pos;
    export let topics;
    export let onHover;
    export let onLeave;
    export let polarToCartesian;

    export let centerX = 0;
    export let centerY = 0;
    export let outerRadius = 80;
    export let innerRadius = 36;

    let isHovered = false;
    let groupElement;

    // Compute topicTotals
    const topicTotals = topics.map(cat =>
        person.utterances.filter(u => u.topic === cat).reduce((sum, u) => sum + u.value, 0)
    );
    const sum = topicTotals.reduce((a, b) => a + b, 0);

    function handleEnter() {
        isHovered = true;
        onHover(person);
        groupElement.parentNode.appendChild(groupElement); // Bring to top
    }

    function handleLeave() {
        isHovered = false;
        onLeave();
    }
</script>

<g
        bind:this={groupElement}
        on:mouseenter={handleEnter}
        on:mouseleave={handleLeave}
        tabindex="0"
        role="button"
>
    <circle
            cx={pos.x}
            cy={pos.y}
            r={10}
            fill={person.color}
            stroke={person.color}
            stroke-width="2"
    />

    {#if sum > 0}
        <g transform={`translate(${pos.x}, ${pos.y}) scale(0.25)`}>
            <DonutChart
                    {topics}
                    topicSums={topicTotals}
                    total={sum}
                    {centerX}
                    {centerY}
                    {outerRadius}
                    {innerRadius}
                    {polarToCartesian}
                    showLabels={false}
            />
        </g>
    {/if}

    {#if isHovered}
        <Tooltip x={pos.x} y={pos.y} title={person} infos={topics} />
    {/if}
</g>

<style>
    circle:focus {
        outline: none;
    }
</style>