<template>
  <div ref="root" class="fx-bubbles" aria-hidden="true">
    <div v-for="n in count" :key="n" class="bubble" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useBubbles } from '../../composables/useBubbles'

const props = withDefaults(defineProps<{ count?: number }>(), { count: 28 })
const count = props.count

const root = ref<HTMLElement | null>(null)
const { initializeBubbles, cleanup } = useBubbles()

onMounted(() => {
  if (root.value) initializeBubbles(root.value)
})

onBeforeUnmount(() => {
  cleanup()
})
</script>

<style scoped>
.fx-bubbles {
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: -1;
  pointer-events: none;
}

.bubble {
  position: absolute;
  top: 0;
  left: 50%;
  border-radius: 50%;
  background: radial-gradient(
    circle at 35% 35%,
    rgba(255, 255, 255, 0.36) 0%,
    rgba(255, 255, 255, 0.24) 28%,
    rgba(96, 165, 250, 0.2) 54%,
    rgba(59, 130, 246, 0.1) 74%,
    transparent 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow: 0 0 18px rgba(147, 197, 253, 0.16);
  transform-origin: center;
  animation: bubble-rise var(--bubble-rise, 22s) linear infinite,
    bubble-pulse var(--bubble-pulse, 6s) ease-in-out infinite alternate;
  opacity: var(--bubble-opacity, 0.35);
}

@media (prefers-reduced-motion: reduce) {
  .bubble {
    animation: none;
  }
}

@keyframes bubble-rise {
  0% {
    transform: translate3d(calc(var(--x, 0px) - var(--drift, 0px)), 110vh, 0)
      scale(var(--bubble-scale-start, 1));
  }
  50% {
    transform: translate3d(var(--x, 0px), 10vh, 0)
      scale(var(--bubble-scale-peak, 1.06));
  }
  100% {
    transform: translate3d(calc(var(--x, 0px) + var(--drift, 0px)), -120vh, 0)
      scale(var(--bubble-scale-end, 1));
  }
}

@keyframes bubble-pulse {
  0% {
    opacity: calc(var(--bubble-opacity, 0.35) * 0.6);
  }
  100% {
    opacity: calc(var(--bubble-opacity, 0.35) * 1.1);
  }
}
</style>
