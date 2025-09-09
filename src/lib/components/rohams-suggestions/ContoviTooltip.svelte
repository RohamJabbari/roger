<script>
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
    export let x;
    export let y;
    export let title;
    export let infos;
    export let values = [];
    export let total = 0;

    // Optional safety: fallback to arrays
    $: _labels = Array.isArray(infos) ? infos : [];
    $: _values = Array.isArray(values) ? values : [];

    let tooltip_x_offset = 25;
    let tooltip_y_offset = -30;

    const opacity = tweened(0, {
        duration: 200,
        easing: cubicOut
    });

    $: if (title) opacity.set(1);
    $: if (!title) opacity.set(0);
</script>

<g style="opacity: {$opacity}">
    <rect
            x={x + tooltip_x_offset}
            y={y - tooltip_y_offset}
            width="180"
            height={(_labels.length + 2) * 15}
            fill="white"
            rx="5"
            style={`filter: drop-shadow(4px 4px 10px ${title?.color || '#000'});`}
    />
    <text
            x={x + tooltip_x_offset + 10}
            y={y - tooltip_y_offset + 20}
            font-size="12"
            fill={title?.color || '#000'}
            font-weight="bold"
    >
        {title ? `${title.personId} (${title.role})` : ''}
    </text>
    {#if title}
        {#each _labels as cat, idx}
            {@const v = +(_values[idx] ?? 0)}
            {@const pct = total > 0 ? ((v / total) * 100).toFixed(1) : '0.0'}
            <text
                    x={x + tooltip_x_offset + 10}
                    y={y - tooltip_y_offset + 40 + idx * 15}
                    font-size="12"
                    fill="#333"
            >
                {`${cat}: ${v.toFixed(2)} (${pct}%)`}
            </text>
        {/each}
    {/if}
</g>