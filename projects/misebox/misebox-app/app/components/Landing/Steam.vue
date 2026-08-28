<template>
  <div ref="root" class="fx-steam" aria-hidden="true">
    <div v-for="n in count" :key="n" class="puff" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useSteam } from '../../composables/useSteam'

const props = withDefaults(defineProps<{ count?: number }>(), { count: 18 })
const count = props.count

const root = ref<HTMLElement | null>(null)
const { initializeSteam, cleanup } = useSteam()

onMounted(() => {
  if (root.value) initializeSteam(root.value)
})

onBeforeUnmount(() => {
  cleanup()
})
</script>

<style scoped>
.fx-steam {
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: -1;
  pointer-events: none;
}

.puff {
  position: absolute;
  top: 0;
  left: 50%;
  border-radius: 50%;
  background: radial-gradient(
    ellipse at 40% 40%,
    rgba(59, 130, 246, 0.42) 0%,
    rgba(147, 197, 253, 0.28) 38%,
    rgba(191, 219, 254, 0.18) 70%,
    transparent 100%
  );
  filter: blur(var(--steam-blur, 4px));
  transform-origin: center;
  animation: steam-rise var(--steam-rise, 26s) linear infinite,
    steam-fade var(--steam-fade, 8s) ease-in-out infinite alternate;
  opacity: var(--steam-opacity, 0.4);
}

@media (prefers-reduced-motion: reduce) {
  .puff {
    animation: none;
  }
}

@keyframes steam-rise {
  0% {
    transform: translate3d(calc(var(--x, 0px) - var(--drift, 0px)), 120vh, 0)
      scale(var(--steam-scale-start, 1));
  }
  50% {
    transform: translate3d(var(--x, 0px), 12vh, 0)
      scale(var(--steam-scale-peak, 1.2));
  }
  100% {
    transform: translate3d(calc(var(--x, 0px) + var(--drift, 0px)), -130vh, 0)
      scale(var(--steam-scale-end, 1.1));
  }
}

@keyframes steam-fade {
  0% {
    opacity: calc(var(--steam-opacity, 0.4) * 0.65);
  }
  100% {
    opacity: calc(var(--steam-opacity, 0.4) * 1.05);
  }
}
</style>
