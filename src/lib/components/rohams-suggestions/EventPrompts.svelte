<script>
    import { createEventDispatcher, onMount, onDestroy } from "svelte";

    export let title = "";
    export let initialData = null; // 👈 passed in from parent
    export let defaultColor = "hsl(238, 83%, 67%)";

    const dispatch = createEventDispatcher();
    let modalEl;



    const colors = [
        { name: "Blue", value: "hsl(220, 80%, 70%)" },
        { name: "Red", value: "hsl(0, 80%, 70%)" },
        { name: "Orange", value: "hsl(40, 80%, 70%)" },
        { name: "Green", value: "hsl(120, 80%, 70%)" },
        { name: "Purple", value: "hsl(300, 80%, 70%)" }
    ];

    let description = initialData?.description || "";
    let selectedColor = initialData?.color || defaultColor;
    let time = initialData?.time ?? null;
    let start = initialData?.start ?? null;
    let end = initialData?.end ?? null;

    let hasRangeFields = initialData?.start != null && initialData?.end != null;
    let hasEventFields = initialData?.time != null;


    function autoResize(event) {
        const el = event.target;
        el.style.height = "auto";
        el.style.height = el.scrollHeight + "px";
    }

    function submit() {
        const finalDescription = description.trim() || "New Event";

        if (start != null && end != null) {
            dispatch("submit", {
                description: finalDescription,
                color: selectedColor,
                start,
                end
            });
        } else if (time != null) {
            dispatch("submit", {
                description: finalDescription,
                color: selectedColor,
                time
            });
        } else {
            dispatch("submit", {
                description: finalDescription,
                color: selectedColor
            });
        }
    }

    function cancel() {
        dispatch("cancel");
    }

    function handleKeydown(event) {
        if (event.key === "Escape") {
            event.preventDefault();
            cancel();
        } else if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit();
        }
    }

    function handleBackdropClick(event) {
        if (!modalEl.contains(event.target)) {
            cancel();
        }
    }

    onMount(() => {
        window.addEventListener("keydown", handleKeydown);
    });

    onDestroy(() => {
        window.removeEventListener("keydown", handleKeydown);
    });
</script>

<!-- Backdrop -->
<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" on:click={handleBackdropClick}>
    <!-- Modal -->
    <div
            bind:this={modalEl}
            class="bg-white rounded-lg shadow-lg px-6 py-6 w-auto min-w-[30vw] max-w-[90vw] space-y-4"
    >
        <h2 class="text-lg font-semibold">{title}</h2>

        <div>
            <label class="block text-sm font-medium mb-1">Description:</label>
            <textarea
                    bind:value={description}
                    class="w-full border border-gray-300 rounded px-2 py-1 text-sm resize-none leading-snug"
                    placeholder="e.g. Speaker interrupt"
                    rows="1"
                    style="min-height: 2rem;"
                    on:input={autoResize}
                    autofocus
            />
        </div>

        {#if hasEventFields}
            <div>
                <label class="block text-sm font-medium mb-1">Time:</label>
                <input
                    type="number"
                    bind:value={time}
                    min="0"
                    step="0.1"
                    class="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                />
            </div>
        {/if}

        {#if hasRangeFields}
            <div>
                <label class="block text-sm font-medium mb-1">Start:</label>
                <input
                    type="number"
                    bind:value={start}
                    min="0"
                    step="0.1"
                    class="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                />
            </div>

            <div>
                <label class="block text-sm font-medium mb-1">End:</label>
                <input
                    type="number"
                    bind:value={end}
                    min="0"
                    step="0.1"
                    class="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                />
            </div>
        {/if}

        <div class="flex space-x-2">
            {#each colors as c}
                <div
                        class="w-6 h-6 rounded cursor-pointer border-2"
                        style="background-color: {c.value}; border-color: {selectedColor === c.value ? 'black' : 'transparent'}"
                        on:click={() => selectedColor = c.value}
                        title={c.name}
                />
            {/each}
        </div>

        <div class="flex justify-end space-x-2">
            <button on:click={cancel} class="text-sm text-gray-600">Cancel</button>
            <button on:click={submit} class="bg-blue-600 text-white text-sm px-3 py-1 rounded">OK</button>
        </div>
    </div>
</div>