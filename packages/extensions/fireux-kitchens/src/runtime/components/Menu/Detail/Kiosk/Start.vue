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
  secondaryColor?: string
  wordmarkImageUrl?: string
}>()

defineEmits<{
  (event: 'start', mode: 'eat_in' | 'takeaway'): void
}>()

const backgroundStyle = computed(() => {
  const url = String(props.backgroundImageUrl || '').trim()

  return url
    ? {
        '--kiosk-background-image': `url('${url}')`,
        '--kiosk-primary': props.primaryColor || '#ff7912',
        '--kiosk-secondary': props.secondaryColor || '#050505',
      }
    : {
        '--kiosk-primary': props.primaryColor || '#ff7912',
        '--kiosk-secondary': props.secondaryColor || '#050505',
      }
})
</script>

<style scoped>
.kiosk-start {
  --kiosk-start-actions-gap: 1.25rem;
  --kiosk-start-actions-width: min(100%, 44rem);
  --kiosk-start-button-height: 7rem;
  --kiosk-start-wordmark-width: min(96%, 42rem);
  --kiosk-logo-size: min(25.5vw, 17.25rem);
  --kiosk-logo-top: 12.75svh;

  position: relative;
  display: grid;
  min-height: 100svh;
  overflow: hidden;
  place-items: center;
  background-image:
    linear-gradient(rgb(0 0 0 / 22%), rgb(0 0 0 / 34%)),
    var(
      --kiosk-background-image,
      linear-gradient(145deg, #111, #2a1204)
    );
  background-color: var(--kiosk-secondary, #050505);
  background-position: center, center;
  background-repeat: no-repeat;
  background-size: 100% 100%, auto 100%;
  color: white;
}

.kiosk-start__actions {
  position: relative;
  z-index: 1;
  display: grid;
  width: var(--kiosk-start-actions-width);
  gap: var(--kiosk-start-actions-gap);
}

.kiosk-start__logo {
  position: absolute;
  inset-inline: 0;
  top: var(--kiosk-logo-top);
  z-index: 0;
  width: var(--kiosk-logo-size);
  height: auto;
  max-height: var(--kiosk-logo-size);
  margin-inline: auto;
  object-fit: contain;
  pointer-events: none;
  transform: translateY(-50%);
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
    --kiosk-logo-size: min(22vw, 10.8rem);
    --kiosk-logo-top: 14.6svh;

    padding: 16svh 1.25rem 2rem;
  }
}

@media (max-width: 560px) {
  .kiosk-start {
    --kiosk-start-actions-gap: 0.85rem;
    --kiosk-start-button-height: 5rem;
    --kiosk-start-wordmark-width: min(100%, 24rem);
    --kiosk-logo-size: min(25vw, 6.25rem);
    --kiosk-logo-top: 11.5svh;
  }
}
</style>
