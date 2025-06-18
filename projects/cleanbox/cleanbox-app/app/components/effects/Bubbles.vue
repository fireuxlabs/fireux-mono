<template>
  <div class="bubblefield">
    <div v-for="n in 20" :key="n" class="bubble" />
  </div>
</template>

<script setup>
const { initializeBubbles } = useBubbles()

onMounted(() => {
  initializeBubbles()
})
</script>

<style scoped>
.bubblefield {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
  pointer-events: none;
}

.bubble {
  position: absolute;
  background: radial-gradient(
    circle at 30% 30%,
    rgba(34, 197, 94, 0.3) 0%,
    rgba(34, 197, 94, 0.2) 30%,
    rgba(34, 197, 94, 0.1) 70%,
    transparent 100%
  );
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 50%;
  animation-name: pop, floatUp, sway;
  animation-iteration-count: infinite, infinite, infinite;
  animation-direction: alternate, normal, alternate;
  animation-timing-function: ease-in-out, linear, ease-in-out;
  animation-fill-mode: none, none, none;
}

@keyframes pop {
  0% {
    transform: scale(0.8);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 0.4;
  }
}

@keyframes floatUp {
  0% {
    transform: translateY(100vh);
  }
  100% {
    transform: translateY(-100vh);
  }
}

@keyframes sway {
  0% {
    transform: translateX(-10px);
  }
  100% {
    transform: translateX(10px);
  }
}
</style>
