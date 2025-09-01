<script>
  import { select } from "d3-selection";
  import { axisBottom, axisLeft } from "d3-axis";

  export let width;
  export let height;
  export let classNames = '';
  export let ticks = undefined;
  export let tickFormat = undefined;
  export let tickValues = undefined;
  export let tickSize = 0;
  export let tickPadding = 8;
  export let position;
  export let scale;
  export let showGridLines = false;
  export let transform = undefined;
  export let rotate = false;
  export let axisLine = false;
  let g;
  
  $: {
    select(g).selectAll("*").remove();

    let axis;
    switch (position) {
      case "bottom":
        axis = axisBottom(scale).tickSizeOuter(0);
        transform = `translate(0, ${height})`;
        if (showGridLines) {
          axis.tickSize(-height);
        } else {
          axis.tickSize(tickSize);
        }
        break;
      case "left":
        axis = axisLeft(scale).tickSizeOuter(0);
        if (showGridLines) {
          axis.tickSize(-width);
        } else {
          axis.tickSize(0);
        }
    }

    axis.tickPadding(tickPadding);

    if (tickFormat) {
      axis.tickFormat(tickFormat);
    }

    if (ticks) {
      axis.ticks(ticks);
    }

    if (tickValues) {
      axis.tickValues(tickValues);
    }

    if (rotate) {
      select(g)
        .selectAll(".tick text")
        .attr("transform", `rotate(${rotate}deg) translateY(30px)`);
    }

    select(g).call(axis);

    if (!axisLine) {
      select(g).call(g => g.select(".domain").remove())
    }
  }
</script>
  
<g class={`axis ${classNames}`} bind:this={g} {transform} />

<style>
  :global(.tick line) {
      shape-rendering: crispedges;
      stroke-width: 2px;
      /* stroke: theme('colors.mira-gray.700'); */
  }
  :global(.tick text) {
      font-size: 0.875rem;
  }
  :global(.text-2xs .tick text) {
      font-size: 0.725rem;
  }
  </style>