<script>
    export let stress = [];
    export let feeling = [];
    export let duration = 3; // total duration in seconds

    // SVG dimensions
    const svgHeight = 40;
    const svgWidth = '100%';

    let hoverIndex = null;
    let hoverX = 0;

    function handleMouseMove(event) {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const index = Math.floor((x / rect.width) * stress.length);
        if (index >= 0 && index < stress.length) {
            hoverIndex = index;
            hoverX = x;
        } else {
            hoverIndex = null;
        }
    }

    function handleMouseLeave() {
        hoverIndex = null;
    }
</script>

<div style="position: relative; width: 100%">
    <svg width={svgWidth} height={svgHeight} on:mousemove={handleMouseMove} on:mouseleave={handleMouseLeave}>
        {#if stress.length > 1}
            {#each stress.slice(1) as _, i}
                <line
                        x1={(i / (stress.length - 1)) * 100 + '%'}
                        y1={(1 - (stress[i] + 100) / 200) * svgHeight}
                        x2={((i + 1) / (stress.length - 1)) * 100 + '%'}
                        y2={(1 - (stress[i + 1] + 100) / 200) * svgHeight}
                        stroke={`rgb(${255 - ((feeling[i] + 100) / 200) * 255}, ${(feeling[i] + 100) / 200 * 255}, 0)`}
                        stroke-width="2"
                />
            {/each}
        {/if}
    </svg>

    {#if hoverIndex !== null}
        <div style="position: absolute; top: 35px; left: {hoverX}px; background: rgba(0,0,0,0.75); color: white; padding: 0.3rem; border-radius: 4px; font-size: 0.75rem; white-space: nowrap;">
            Time: {(duration * hoverIndex / stress.length).toFixed(2)}s<br>
            Stress: {stress[hoverIndex]?.toFixed(2)}<br>
            Feeling: {feeling[hoverIndex]?.toFixed(2)}
        </div>
    {/if}
</div>