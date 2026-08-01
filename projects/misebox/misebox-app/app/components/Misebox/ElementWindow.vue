<template>
  <section class="misebox-element-window" aria-label="Misebox product cards">
    <div
      class="misebox-element-window__viewport"
      tabindex="0"
      aria-label="Scroll through Misebox product cards from left to right"
    >
      <div class="misebox-element-window__grid">
        <div class="misebox-element-window__item misebox-element-window__item--kitchens">
          <slot name="kitchens" />
        </div>
        <div class="misebox-element-window__item">
          <slot name="menu" />
        </div>
        <div class="misebox-element-window__item">
          <slot name="dish" />
        </div>
        <div class="misebox-element-window__item">
          <slot name="mise" />
        </div>
        <div class="misebox-element-window__item">
          <slot name="recipe" />
        </div>
        <div class="misebox-element-window__item">
          <slot name="supplier-item" />
        </div>
        <div class="misebox-element-window__item">
          <slot name="order-item" />
        </div>
        <div class="misebox-element-window__item">
          <slot name="supplier" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Mobile-first baseline. Width queries below may only enhance this layout. */
.misebox-element-window {
  min-width: 0;
}

.misebox-element-window__viewport {
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior: contain;
  padding: calc(var(--spacing) * 2);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 4);
  background: color-mix(in srgb, var(--ui-bg) 88%, transparent);
  box-shadow: 0 calc(var(--spacing) * 3) calc(var(--spacing) * 8)
    color-mix(in srgb, var(--ui-text) 10%, transparent);
  scroll-snap-type: x proximity;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
  scrollbar-color: var(--ui-border) transparent;
}

.misebox-element-window__viewport:focus-visible {
  outline: 2px solid var(--ui-primary);
  outline-offset: var(--spacing);
}

.misebox-element-window__grid {
  display: grid;
  grid-auto-columns: minmax(17rem, 84vw);
  grid-auto-flow: column;
  gap: calc(var(--spacing) * 2);
  min-width: 0;
  width: max-content;
}

.misebox-element-window__item {
  min-width: 0;
  scroll-snap-align: start;
}

@media (min-width: 48rem) {
  .misebox-element-window__grid {
    grid-auto-columns: minmax(18rem, 20rem);
  }
}
</style>
