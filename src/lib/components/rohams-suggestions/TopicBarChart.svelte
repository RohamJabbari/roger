<script>
  import { filteredData } from "$lib/stores/app.js";
  import { speakerColorScale } from "$lib/stores/speaker.js";
  import { topicList } from "$lib/dataProcessing.js";

  export let speakers = [];

  // Aggregate topic data by participant
  $: topicData = topicList.map(topic => {
    const participantValues = {};
    speakers.forEach(speaker => {
      participantValues[speaker] = ($filteredData?.transcript ?? [])
        .filter(d => d.speaker === speaker)
        .reduce((sum, d) => sum + (d?.topicMemberships?.[topic] ?? 0), 0);
    });
    return {
      category: topic,
      ...participantValues
    };
  });
</script>

<div class="mt-4">
  {#each topicData as topic}
    {@const total = speakers.reduce((sum, speaker) => sum + (topic[speaker] || 0), 0)}
    {#if total > 0}
      <div class="mb-3">
        <div class="flex items-center mb-1">
          <div class="w-24 text-sm font-medium text-right pr-3">{topic.category}</div>
          <div class="flex-1 flex h-6 bg-gray-200 rounded overflow-hidden">
            {#each speakers as speaker}
              {@const value = topic[speaker] || 0}
              {@const percentage = (value / total) * 100}
              {#if percentage > 0}
                <div 
                  class="h-full flex items-center justify-center text-xs text-white font-medium"
                  style="background-color: {$speakerColorScale ? $speakerColorScale(speaker) : '#666'}; width: {percentage}%;"
                  title="{speaker}: {value.toFixed(2)} ({percentage.toFixed(1)}%)"
                >
                  {#if percentage > 15}
                    {percentage.toFixed(0)}%
                  {/if}
                </div>
              {/if}
            {/each}
          </div>
          <div class="w-12 text-sm text-gray-600 pl-2">{total.toFixed(1)}</div>
        </div>
      </div>
    {/if}
  {/each}
</div>