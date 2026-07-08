<template>
  <section
    class="kiosk-start"
    :style="backgroundStyle"
    aria-label="Kiosk start screen"
  >
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
import { computed } from 'vue'

const props = defineProps<{
  backgroundImageUrl?: string
}>()

defineEmits<{
  (event: 'start', mode: 'eat_in' | 'takeaway'): void
}>()

const backgroundStyle = computed(() => {
  const url = String(props.backgroundImageUrl || '').trim()

  return url
    ? {
        '--kiosk-start-background-image': `url('${url}')`,
      }
    : {}
})
</script>

<style scoped>
.kiosk-start {
  position: relative;
  display: grid;
  min-height: 100svh;
  overflow: hidden;
  place-items: center;
  padding: 2rem;
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
  gap: 1rem;
}

.kiosk-start__button {
  display: inline-grid;
  width: 100%;
  min-height: 7rem;
  place-items: center;
  border: 1px solid rgb(255 121 18 / 70%);
  border-radius: 1.5rem;
  background: rgb(0 0 0 / 74%);
  color: white;
  cursor: pointer;
  font: inherit;
  font-size: clamp(1.75rem, 5vw, 3rem);
  font-weight: 950;
  box-shadow: 0 1rem 2.5rem rgb(0 0 0 / 35%);
  backdrop-filter: blur(10px);
}

.kiosk-start__button:hover,
.kiosk-start__button:focus-visible {
  background: rgb(217 91 9 / 90%);
}

.kiosk-start__button:focus-visible {
  outline: 2px solid rgb(255 121 18 / 90%);
  outline-offset: 0.3rem;
}

@media (min-width: 720px) {
  .kiosk-start__actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
