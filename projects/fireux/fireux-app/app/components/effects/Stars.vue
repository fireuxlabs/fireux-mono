<template>
  <div class="starfield" aria-hidden="true">
    <div v-for="n in count" :key="n" class="star" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useStarfield } from '../../composables/useStarfield'

const props = withDefaults(defineProps<{ count?: number }>(), { count: 64 })
const count = props.count

const { initializeStars } = useStarfield()

onMounted(() => {
  initializeStars()
})
</script>

<style scoped>
.starfield {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
  pointer-events: none;
}

.star {
  position: absolute;
  background: var(--color-primary-500, var(--ui-primary));
  border-radius: 50%;
  animation-name: twinkle, moveUp;
  animation-duration: 4s, 60s;
  animation-iteration-count: infinite, infinite;
  animation-direction: alternate, normal;
  animation-timing-function: ease, linear;
  animation-fill-mode: none, none;
}

@media (prefers-reduced-motion: reduce) {
  .star {
    animation: none;
  }
}

@keyframes twinkle {
  0% {
    opacity: 0.2;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.2;
  }
}

@keyframes moveUp {
  0% {
    transform: translateY(100vh);
  }
  100% {
    transform: translateY(-100vh);
  }
}
</style>
