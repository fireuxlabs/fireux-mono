<template>
  <div class="floating-particles">
    <div v-for="n in 30" :key="n" class="particle" />
  </div>
</template>

<script setup>
const { initializeParticles } = useFloatingParticles()

onMounted(() => {
  initializeParticles()
})
</script>

<style scoped>
.floating-particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
  pointer-events: none;
}

.particle {
  position: absolute;
  background: var(--ui-primary);
  border-radius: 50%;
  animation: float infinite ease-in-out;
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(var(--move-x), var(--move-y)) rotate(90deg);
  }
  50% {
    transform: translate(calc(var(--move-x) * 0.5), calc(var(--move-y) * 1.5))
      rotate(180deg);
  }
  75% {
    transform: translate(calc(var(--move-x) * -0.3), var(--move-y))
      rotate(270deg);
  }
}
</style>
