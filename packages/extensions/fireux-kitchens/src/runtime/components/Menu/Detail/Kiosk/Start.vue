<template>
  <section
    class="kiosk-start"
    aria-label="Kiosk choices"
  >
    <div class="kiosk-start__actions">
      <img
        v-if="wordmarkImageUrl"
        class="kiosk-start__wordmark"
        :src="wordmarkImageUrl"
        :alt="kitchenName || ''"
      >

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
defineProps<{
  kitchenName?: string
  wordmarkImageUrl?: string
}>()

defineEmits<{
  (event: 'start', mode: 'eat_in' | 'takeaway'): void
}>()
</script>

<style scoped>
.kiosk-start {
  --kiosk-start-actions-gap: 1.25rem;
  --kiosk-start-actions-width: min(100%, 44rem);
  --kiosk-start-button-height: 7rem;
  --kiosk-start-wordmark-width: min(96%, 42rem);

  position: relative;
  display: grid;
  height: 100svh;
  place-items: center;
  color: white;
}

.kiosk-start__actions {
  position: relative;
  z-index: 1;
  display: grid;
  width: var(--kiosk-start-actions-width);
  gap: var(--kiosk-start-actions-gap);
}

.kiosk-start__button {
  display: inline-grid;
  width: 100%;
  min-height: var(--kiosk-start-button-height);
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--kiosk-primary) 76%, white);
  border-radius: 1.5rem;
  background: color-mix(in srgb, var(--kiosk-secondary) 33%, transparent);
  color: white;
  cursor: pointer;
  font: inherit;
  font-size: clamp(1.75rem, 5vw, 3rem);
  font-weight: 950;
  text-shadow: 0 0.25rem 0.9rem rgb(0 0 0 / 42%);
}

.kiosk-start__wordmark {
  justify-self: center;
  width: var(--kiosk-start-wordmark-width);
  max-height: 13rem;
  margin-bottom: 1rem;
  object-fit: contain;
}

.kiosk-start__button:hover,
.kiosk-start__button:focus-visible {
  background: color-mix(in srgb, var(--kiosk-secondary) 46%, transparent);
}

.kiosk-start__button:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--kiosk-primary) 82%, white);
  outline-offset: 0.3rem;
}

@media (min-width: 720px) {
  .kiosk-start__wordmark {
    grid-column: 1 / -1;
  }

  .kiosk-start__actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .kiosk-start {
    --kiosk-start-actions-width: min(100%, 34rem);
    --kiosk-start-button-height: 5.75rem;

    padding: 16svh 1.25rem 2rem;
  }
}

@media (max-width: 560px) {
  .kiosk-start {
    --kiosk-start-actions-gap: 0.85rem;
    --kiosk-start-button-height: 5rem;
    --kiosk-start-wordmark-width: min(100%, 24rem);
  }
}
</style>
