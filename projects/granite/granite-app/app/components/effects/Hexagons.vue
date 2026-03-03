<template>
  <div class="granite-hexagons" aria-hidden="true">
    <div
      v-for="hex in hexes"
      :key="hex.id"
      class="granite-hexagons__item"
      :style="{
        left: hex.left,
        top: hex.top,
        width: hex.size,
        height: hex.size,
        animationDelay: hex.delay,
      }"
    />
  </div>
</template>

<script setup lang="ts">
const hexes = Array.from({ length: 18 }, (_, index) => {
  const col = index % 6
  const row = Math.floor(index / 6)
  const jitter = (index % 3) * 2
  const left = `${8 + col * 17 + jitter}%`
  const top = `${6 + row * 26 + (index % 2) * 5}%`
  const size = `${52 + (index % 5) * 10}px`
  const delay = `${index * 0.35}s`

  return {
    id: `hex-${index}`,
    left,
    top,
    size,
    delay,
  }
})
</script>

<style scoped>
.granite-hexagons {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: -1;
  overflow: hidden;
}

.granite-hexagons__item {
  position: absolute;
  opacity: 0.1;
  filter: blur(1.4px);
  border: 1px solid color-mix(in srgb, var(--ui-primary) 38%, transparent);
  clip-path: polygon(
    25% 6.7%,
    75% 6.7%,
    100% 50%,
    75% 93.3%,
    25% 93.3%,
    0% 50%
  );
  animation: granite-hex-float 14s ease-in-out infinite;
}

@keyframes granite-hex-float {
  0% {
    transform: translateY(0px) scale(1);
    opacity: 0.08;
  }
  50% {
    transform: translateY(-8px) scale(1.03);
    opacity: 0.14;
  }
  100% {
    transform: translateY(0px) scale(1);
    opacity: 0.08;
  }
}
</style>
