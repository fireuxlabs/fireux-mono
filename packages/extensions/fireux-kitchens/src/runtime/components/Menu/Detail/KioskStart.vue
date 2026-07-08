<template>
  <section class="kiosk-start" aria-label="Kiosk start screen">
    <div class="kiosk-start__actions">
      <button
        type="button"
        class="kiosk-start__button"
        @click="$emit('start', 'eat_in')"
      >
        Eat in
      </button>

      <button
        type="button"
        class="kiosk-start__button"
        @click="$emit('start', 'takeaway')"
      >
        Takeaway
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
defineEmits<{
  (event: 'start', mode: 'eat_in' | 'takeaway'): void
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

.kiosk-start__actions {
  display: grid;
  width: min(100%, 42rem);
  gap: 1rem;
}

.kiosk-start__button {
  display: inline-grid;
  width: 100%;
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

@media (min-width: 720px) {
  .kiosk-start__actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
