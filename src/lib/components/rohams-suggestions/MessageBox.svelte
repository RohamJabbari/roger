<script>
    import StressMeter from './StressMeter.svelte';
    import SamGlyph from '../SamGlyph.svelte';
    import { speakerColorScale } from "$lib/stores/speaker";
    import { showEmotions } from '$lib/stores/app';
    import { createEventDispatcher } from "svelte";
    import { tick } from 'svelte';


    export let message;
    export let color = 'red';

    const dispatch = createEventDispatcher();

    const clampedAvg = Math.max(-100, Math.min(100, typeof message.valence === 'number' ? message.valence : 0));
    $: boxGlow = `0 0 20px rgba(${255 - ((clampedAvg + 100) * 1.275)}, ${(clampedAvg + 100) * 1.275}, 0, 0.6)`;
    
    // Tooltip state
    let showTooltip = false;
    let tooltipX = 0;
    let tooltipY = 0;

    function parseTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = String(Math.floor(seconds % 60)).padStart(2, '0');
        return `${mins}:${secs}`;
    }

    async function handleJump(seconds) {
        dispatch('navigateTime', { time: seconds });
        await tick();
        dispatch('playSpeaker', { speaker: message.speaker, start: seconds, end: seconds + 2 });
    }
</script>

<!-- Main Box -->
<div class="mb-1 max-w-[80%]" style="margin-left: 0.75rem;">
    <div
            class="relative flex rounded bg-white shadow"
            style="box-shadow: {boxGlow};"
    >
        <!-- Colored vertical bar with SamGlyph inside -->
        <div
            class={`flex items-center justify-center relative flex-shrink-0 overflow-visible ${$showEmotions ? 'w-8' : 'w-3'}`}
            style="
                background-color: {$speakerColorScale ? $speakerColorScale(message.speaker) : color};
                border-top-left-radius: 5px;
                border-bottom-left-radius: 5px;"
            on:mouseenter={(e) => {
                showTooltip = true;
                const rect = e.currentTarget.getBoundingClientRect();
                tooltipX = rect.left - 10;
                tooltipY = rect.top + rect.height / 2;
            }}
            on:mouseleave={() => {
                showTooltip = false;
            }}
        >
            {#if $showEmotions}
                <div class="scale-90">
                <SamGlyph
                        arousal={message.arousal_level}
                        valence={message.valence_level}
                        dominance={message.dominance_level}
                />
                </div>
            {/if}
        </div>

        <!-- Main content area -->
        <div class="flex-1 p-3 rounded-r">
            <!-- Top bar: Speaker & Time -->
            <div class="flex justify-between items-start">
                <div>
                    <strong>{message.nameTag}</strong>
                    <button class="text-xs text-gray-500 hover:underline ml-2"
                            on:click={() => handleJump(message.start)}>
                        {parseTime(message.start)}
                    </button>
                    <span class="text-xs text-gray-400">–</span>
                    <button class="text-xs text-gray-500 hover:underline"
                            on:click={() => handleJump(message.end)}>
                        {parseTime(message.end)}
                    </button>
                </div>
            </div>

            <!-- Message content -->
            <p class="mt-2">{@html message.text_llm_en ?? '<i>incomp.</i>'}</p>
        </div>
    </div>
</div>

<!-- SAM Values Tooltip -->
{#if showTooltip}
    <div 
        class="fixed bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg z-50 pointer-events-none"
        style="right: {window.innerWidth - tooltipX}px; top: {tooltipY - 25}px;"
    >
        <div>Arousal: {message.arousal ?? 'N/A'} (Level: {message.arousal_level ?? 'N/A'})</div>
        <div>Valence: {message.valence ?? 'N/A'} (Level: {message.valence_level ?? 'N/A'})</div>
        <div>Dominance: {message.dominance ?? 'N/A'} (Level: {message.dominance_level ?? 'N/A'})</div>
    </div>
{/if}