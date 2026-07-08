<template>
  <section
    class="kiosk-start"
    :style="backgroundStyle"
    aria-label="Kiosk start screen"
  >
    <img
      v-if="logoImageUrl"
      class="kiosk-start__logo"
      :src="logoImageUrl"
      :alt="kitchenName || ''"
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
import { computed } from 'vue'

const props = defineProps<{
  backgroundImageUrl?: string
  kitchenName?: string
  logoImageUrl?: string
  primaryColor?: string
  wordmarkImageUrl?: string
}>()

defineEmits<{
  (event: 'start', mode: 'eat_in' | 'takeaway'): void
}>()

const backgroundStyle = computed(() => {
  const url = String(props.backgroundImageUrl || '').trim()

  return url
    ? {
        '--kiosk-start-background-image': `url('${url}')`,
        '--kiosk-start-primary-color': props.primaryColor || '#ff7912',
      }
    : {
        '--kiosk-start-primary-color': props.primaryColor || '#ff7912',
      }
})
</script>

<style scoped>
.kiosk-start {
  position: relative;
  display: grid;
  min-height: 100svh;
  overflow: hidden;
  place-items: center;
  background-image:
    linear-gradient(rgb(0 0 0 / 22%), rgb(0 0 0 / 34%)),
    var(
      --kiosk-start-background-image,
      linear-gradient(145deg, #111, #2a1204)
    );
  background-position: center;
  background-size: cover;
  color: white;
}

.kiosk-start__actions {
  position: relative;
  z-index: 1;
  display: grid;
  width: min(100%, 44rem);
  gap: 1.25rem;
}

.kiosk-start__logo {
  position: absolute;
  inset-inline: 0;
  top: 14.85svh;
  z-index: 0;
  width: min(31vw, 21rem);
  aspect-ratio: 1;
  margin-inline: auto;
  padding: 1.1rem;
  border-radius: 999px;
  background: rgb(0 0 0 / 58%);
  box-shadow: 0 1rem 2.5rem rgb(0 0 0 / 28%);
  object-fit: contain;
  transform: translateY(-50%);
}

.kiosk-start__button {
  display: inline-grid;
  width: 100%;
  min-height: 7rem;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--kiosk-start-primary-color) 76%, white);
  border-radius: 1.5rem;
  background: color-mix(in srgb, var(--kiosk-start-primary-color) 86%, black);
  color: white;
  cursor: pointer;
  font: inherit;
  font-size: clamp(1.75rem, 5vw, 3rem);
  font-weight: 950;
  box-shadow: 0 1rem 2.5rem rgb(0 0 0 / 35%);
  backdrop-filter: blur(10px);
}

.kiosk-start__wordmark {
  justify-self: center;
  width: min(96%, 42rem);
  max-height: 13rem;
  margin-bottom: 1rem;
  object-fit: contain;
}

.kiosk-start__button:hover,
.kiosk-start__button:focus-visible {
  background: color-mix(in srgb, var(--kiosk-start-primary-color) 92%, white);
}

.kiosk-start__button:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--kiosk-start-primary-color) 82%, white);
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
</style>
