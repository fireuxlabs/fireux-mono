<template>
  <section class="kiosk-start" aria-label="Kiosk start screen">
    <button
      type="button"
      class="kiosk-start__button"
      @click="$emit('start')"
    >
      Order
    </button>
  </section>
</template>

<script setup lang="ts">
defineEmits<{
  (event: 'start'): void
}>()
</script>

<style scoped>
.kiosk-start {
  display: grid;
  min-height: 100svh;
  place-items: center;
  padding: 2rem;
  background: var(--menu-bg);
  color: var(--menu-text);
}

.kiosk-start__button {
  display: inline-grid;
  min-width: min(18rem, 80vw);
  min-height: 5rem;
  place-items: center;
  border: 1px solid var(--menu-primary);
  border-radius: var(--menu-radius-control);
  background: var(--menu-primary);
  color: var(--menu-bg);
  cursor: pointer;
  font: inherit;
  font-size: clamp(1.75rem, 5vw, 3rem);
  font-weight: 950;
}

.kiosk-start__button:hover,
.kiosk-start__button:focus-visible {
  background: color-mix(in srgb, var(--menu-primary) 88%, black);
}

.kiosk-start__button:focus-visible {
  outline: 2px solid var(--menu-primary);
  outline-offset: 0.3rem;
}
</style>
