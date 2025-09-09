<script>
    import Tooltip from "$lib/components/rohams-suggestions/ContoviTooltip.svelte";
    import DonutChart from "$lib/components/rohams-suggestions/ContoviDonutChart.svelte";
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';

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

    export let currentSecond = 0;

export let topicParticipation = [];

    // Cache last non-empty participation so the donut stays visible between updates
    let lastTopicParticipation = [];
    let lastSum = 0;

$: sum = Array.isArray(topicParticipation) ? topicParticipation.reduce((a,b)=> a + (+b || 0), 0) : 0;

$: if (sum > 0) {
        lastTopicParticipation = topicParticipation;
        lastSum = sum;
    }

    let isHovered = false;
    let groupElement;

    // Tweened motion for smooth position + subtle fade-in
    const animDuration = 400;
    const tx = tweened(pos?.x ?? 0, { duration: animDuration, easing: cubicOut });
    const ty = tweened(pos?.y ?? 0, { duration: animDuration, easing: cubicOut });
    const topacity = tweened(0, { duration: 250, easing: cubicOut });

    // Initialize animated state on mount
    import { onMount } from 'svelte';
    onMount(() => {
        tx.set(pos?.x ?? 0);
        ty.set(pos?.y ?? 0);
        topacity.set(1);
    });

    // Whenever the target position prop changes, tween to the new spot
    $: if (pos?.x !== undefined) tx.set(pos.x);
    $: if (pos?.y !== undefined) ty.set(pos.y);

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
        style="opacity: {$topacity};"
>
    <circle
            cx={$tx}
            cy={$ty}
            r={10}
            fill={person.color}
            stroke={person.color}
            stroke-width="2"
    />

    {#if lastSum > 0}
        <g transform={`translate(${$tx}, ${$ty}) scale(0.25)`}>
            <DonutChart
                    {topics}
                    topicSums={lastTopicParticipation}
                    total={lastSum}
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
        <Tooltip x={$tx} y={$ty} title={person} infos={topics} values={lastTopicParticipation} total={lastSum} />
    {/if}
</g>

<style>
    circle:focus {
        outline: none;
    }
</style>