<template>
  <div class="starfield" aria-hidden="true">
    <span
      v-for="(star, index) in stars"
      :key="index"
      class="star"
      :style="star"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  ambientRange,
  ambientUnit,
} from 'fireux-core/runtime/utils/ambient-field'

const props = withDefaults(defineProps<{ count?: number }>(), { count: 64 })

type StarStyle = Record<`--star-${string}`, string>

const stars = computed<StarStyle[]>(() =>
  Array.from({ length: props.count }, (_, index) => {
    const travelDuration = ambientRange(index, 5, 340, 680, 17)
    const twinkleDuration = ambientRange(index, 4, 3, 6.5, 17)

    return {
      '--star-left': `${ambientRange(index, 0, 0, 100, 17).toFixed(2)}%`,
      '--star-top': `${ambientRange(index, 1, 0, 100, 17).toFixed(2)}%`,
      '--star-size': `${ambientRange(index, 2, 0.8, 2.5, 17).toFixed(2)}px`,
      '--star-opacity': ambientRange(index, 3, 0.16, 0.72, 17).toFixed(2),
      '--star-twinkle': `${twinkleDuration.toFixed(2)}s`,
      '--star-twinkle-delay': `${(-twinkleDuration * ambientUnit(index, 6, 17)).toFixed(2)}s`,
      '--star-travel': `${travelDuration.toFixed(2)}s`,
      '--star-travel-delay': `${(-travelDuration * ambientUnit(index, 7, 17)).toFixed(2)}s`,
      '--star-glow': `${ambientRange(index, 8, 0, 5, 17).toFixed(2)}px`,
    }
  })
)
</script>

<style scoped>
.starfield {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.star {
  position: absolute;
  top: var(--star-top);
  left: var(--star-left);
  width: var(--star-size);
  height: var(--star-size);
  border-radius: 50%;
  background: var(--ui-primary);
  box-shadow: 0 0 var(--star-glow)
    color-mix(in srgb, var(--ui-primary) 44%, transparent);
  opacity: var(--star-opacity);
  animation:
    star-twinkle var(--star-twinkle) ease-in-out var(--star-twinkle-delay)
      infinite alternate,
    star-drift var(--star-travel) linear var(--star-travel-delay) infinite;
}

@media (prefers-reduced-motion: reduce) {
  .star {
    animation: none;
    opacity: calc(var(--star-opacity) * 0.7);
  }
}

@keyframes star-twinkle {
  0% {
    opacity: calc(var(--star-opacity) * 0.35);
  }
  50% {
    opacity: var(--star-opacity);
  }
  100% {
    opacity: calc(var(--star-opacity) * 0.45);
  }
}

@keyframes star-drift {
  0% {
    transform: translate3d(0, 100vh, 0);
  }
  100% {
    transform: translate3d(0, -100vh, 0);
  }
}
</style>
