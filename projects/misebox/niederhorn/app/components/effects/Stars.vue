<template>
  <div ref="canvas" class="stars" />
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

const canvas = ref<HTMLDivElement | null>(null)
let animation: number | null = null

const makeStar = () => {
  const star = document.createElement('span')
  const size = Math.random() * 2 + 1
  const duration = Math.random() * 3 + 3
  const delay = Math.random() * 4
  star.className = 'stars__item'
  star.style.width = `${size}px`
  star.style.height = `${size}px`
  star.style.left = `${Math.random() * 100}%`
  star.style.animationDuration = `${duration}s`
  star.style.animationDelay = `${delay}s`
  return star
}

const populate = () => {
  if (!canvas.value) return
  const count = 36
  for (let i = 0; i < count; i += 1) {
    canvas.value.appendChild(makeStar())
  }
}

const tick = () => {
  animation = globalThis.requestAnimationFrame(tick)
}

onMounted(() => {
  populate()
  tick()
})

onBeforeUnmount(() => {
  if (animation) {
    globalThis.cancelAnimationFrame(animation)
    animation = null
  }
  canvas.value?.replaceChildren()
})

defineOptions({ name: 'NiederhornStarsEffect' })
</script>

<style scoped>
.stars {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.stars__item {
  position: absolute;
  top: -10%;
  background: rgba(244, 250, 255, 0.85);
  border-radius: 999px;
  animation: fall linear infinite;
  opacity: 0;
}

@keyframes fall {
  0% {
    transform: translateY(0);
    opacity: 0;
  }

  10% {
    opacity: 1;
  }

  100% {
    transform: translateY(120vh);
    opacity: 0;
  }
}
</style>
