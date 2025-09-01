<script>
  import StackedBarChart from "$lib/components/StackedBarChart.svelte";
  import {
    aggregatedData,
    aggregatedMotifsData,
    rogerMotifs,
    radarData
  } from "$lib/stores/app";
  import {
    speakerColorScale,
    speakerDarkColorScale,
  } from "$lib/stores/speaker";
  import { stressLevelColorScale, stressLevelColorScalePub, stressLevels } from "$lib/utils";
  import StressLevelLegend from "./header/StressLevelLegend.svelte";
  import TraitsRadar from "$lib/components/rohams-suggestions/TraitsRadar.svelte";



  export let speakers = [];

  let debugMode = true;

  let summaryColumnWidth = 400;

  $: if (debugMode) {
    console.groupCollapsed("🧪 Debug: Speaker & Radar Data");

    console.log("👤 Speakers:", speakers);

    if ($radarData?.length > 0) {
      const grouped = $radarData.reduce((acc, { name, trait, value }) => {
        acc[name] ||= {};
        acc[name][trait] = value;
        return acc;
      }, {});
      console.table(grouped);
    } else {
      console.warn("⚠️ radarData is empty or not loaded");
    }

    console.groupEnd();
  }
</script>



<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6 px-6 xl:pl-10 xl:pr-16 mt-4 mb-4">


  <div class="xl:col-span-1 max-w-full min-w-0">
    <div>
      <div class="font-semibold">Summary</div>
      <TraitsRadar />
    </div>
  </div>

<div class="grid grid-cols-1 sm:grid-cols-1 xl:col-span-1 gap-2 w-full min-w-0">
<!--    <div class="w-full">-->
<!--      <div class="font-semibold">Overview</div>-->
<!--      <StackedBarChart-->
<!--              data={$aggregatedData.speakers}-->
<!--              segments={speakers}-->
<!--              colorScale={$speakerColorScale}-->
<!--              containerWidth={summaryColumnWidth}-->
<!--      />-->
<!--    </div>-->

    <div class="w-full">
      <div class="flex justify-between">
        <div class="font-semibold">Stress</div>
        <div class="mr-3 flex text-gray-700 gap-x-2 items-center font-semibold text-xs" style="font-size: .7rem !important; margin-right: 20px;">
          Low
          <StressLevelLegend />
          High
        </div>
      </div>
      <StackedBarChart
              data={$aggregatedData.stress}
              margin={{ top: 0, right: 20, bottom: 20, left: 30 }}
              segments={[0,1,2,3]}
              colorScale={stressLevelColorScalePub}
              containerWidth={summaryColumnWidth}
      />
    </div>

  
  </div>


</div>