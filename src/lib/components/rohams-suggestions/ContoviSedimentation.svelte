<script>
    export let data; // 👈 now using raw utterance entries
    export let topics;
    export let topicSums;
    export let total;
    export let sedimentationOuterRadius;
    export let polarToCartesian;
    export let centerX;
    export let centerY;

    import Tooltip from "$lib/components/rohams-suggestions/ContoviTooltip.svelte";

    let hovered = null;

    const topicCenterAngles = topics.map((_, i) => {
        const angle = (topicSums[i] / total) * 360;
        const prefixSum = topicSums.slice(0, i).reduce((a, b) => a + b, 0);
        return (prefixSum / total) * 360 + angle / 2;
    });

    const validUtterances = data; // include every row
    let topicCounts = {};
</script>

{#each data as u}
    {@const topic = Object.keys(u).find(k => topics.includes(k) && u[k] > 0)}
    {@const topicIndex = topics.indexOf(topic)}
    {#if topicIndex !== -1}
        {@const centerAngle = topicCenterAngles[topicIndex]}
        {@const count = (topicCounts[topic] = (topicCounts[topic] || 0) + 1)}
        {@const angleOffset = 7}
        {@const angle = centerAngle + (count - 1 - (topicCounts[topic] - 1) / 2) * angleOffset}
        {@const pos = polarToCartesian(centerX, centerY, sedimentationOuterRadius, angle)}

        <circle
                cx={pos.x}
                cy={pos.y}
                r={5}
                fill={u.person?.color || 'gray'}
                stroke="#fff"
                stroke-width="1"
                on:mouseenter={() =>
        hovered = {
          x: pos.x,
          y: pos.y,
          title: u.person?.nameTag || 'Unknown',
          infos: [{ topic, value: u[topic] }],
          extra: { time: u.time }
        }
      }
                on:mouseleave={() => hovered = null}
        />
    {/if}
{/each}

{#if hovered}
    <Tooltip
            x={hovered.x}
            y={hovered.y}
            title={hovered.title?.nameTag || 'Unknown'}
            infos={hovered.infos}
    />
{/if}