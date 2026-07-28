<template>
  <div class="fx-ambient">
    <div class="fx-ambient__effect" aria-hidden="true">
      <slot name="effect" />
    </div>

    <div class="fx-ambient__content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.fx-ambient {
  position: relative;
  min-height: 100%;
  isolation: isolate;
}

.fx-ambient__effect {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  contain: strict;
  pointer-events: none;
  user-select: none;
}

.fx-ambient__content {
  position: relative;
  z-index: 1;
}

@media print {
  .fx-ambient__effect {
    display: none;
  }
}
</style>
