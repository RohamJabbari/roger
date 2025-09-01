<script>
    export let direction = "horizontal"; // "horizontal" or "vertical"
    export let onResizeStart;
    export let onResize;
    export let onResizeEnd;

    function handleMouseDown(event) {
        if (onResizeStart) onResizeStart(event);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
    }

    function handleMouseMove(event) {
        if (onResize) onResize(event);
    }

    function handleMouseUp(event) {
        if (onResizeEnd) onResizeEnd(event);
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
    }
</script>

<div
        class={
    direction === "vertical"
      ? "h-2 bg-gray-300 relative cursor-row-resize hover:bg-gray-500 transition flex items-center justify-center"
      : "w-1 bg-gray-300 cursor-col-resize hover:bg-gray-500 transition"
  }
        on:mousedown={handleMouseDown}
>
</div>
