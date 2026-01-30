<template>
  <div class="bubblefield">
    <div v-for="n in 60" :key="n" class="bubble" />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useBubbles } from '../../composables/useBubbles'

const { initializeBubbles } = useBubbles()

onMounted(() => {
  initializeBubbles()
  setTimeout(() => {
    const field = document.querySelector('.bubblefield') as HTMLElement
    if (field) field.style.display = 'none'
  }, 4000) // Hide after 4 seconds
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
  z-index: 100;
  pointer-events: none;
}

.bubble {
  position: absolute;
  background: radial-gradient(
    circle at 30% 30%,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(255, 255, 255, 0.4) 20%,
    rgba(37, 99, 235, 0.2) 60%,
    transparent 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  animation-name: pop, floatUp, sway, rotate;
  animation-iteration-count: infinite, infinite, infinite, infinite;
  animation-direction: alternate, normal, alternate, normal;
  animation-timing-function: ease-in-out, linear, ease-in-out, linear;
  animation-fill-mode: none, none, none, none;
}

@keyframes pop {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.8;
  }
  100% {
    transform: scale(0.8);
    opacity: 0;
  }
}

@keyframes floatUp {
  0% {
    transform: translateY(100vh);
  }
  100% {
    transform: translateY(-100vh) translateX(30px);
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

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
