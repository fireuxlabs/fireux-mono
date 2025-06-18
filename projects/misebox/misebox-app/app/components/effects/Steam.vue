<template>
  <div class="steamfield">
    <div v-for="n in 15" :key="n" class="steam-puff" />
  </div>
</template>

<script setup>
const { initializeSteam } = useSteam()

onMounted(() => {
  initializeSteam()
})
</script>

<style scoped>
.steamfield {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
  pointer-events: none;
}

.steam-puff {
  position: absolute;
  background: radial-gradient(
    ellipse at center,
    rgba(59, 130, 246, 0.4) 0%,
    rgba(147, 197, 253, 0.3) 40%,
    rgba(186, 230, 253, 0.2) 70%,
    transparent 100%
  );
  border-radius: 50%;
  filter: blur(2px);
  animation-name: expand, riseUp, drift;
  animation-iteration-count: infinite, infinite, infinite;
  animation-direction: alternate, normal, alternate;
  animation-timing-function: ease-out, ease-in, ease-in-out;
  animation-fill-mode: none, none, none;
}

@keyframes expand {
  0% {
    transform: scale(0.5);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.3;
  }
  100% {
    transform: scale(2);
    opacity: 0.1;
  }
}

@keyframes riseUp {
  0% {
    transform: translateY(100vh);
  }
  100% {
    transform: translateY(-100vh);
  }
}

@keyframes drift {
  0% {
    transform: translateX(-20px) rotate(-2deg);
  }
  50% {
    transform: translateX(15px) rotate(1deg);
  }
  100% {
    transform: translateX(-10px) rotate(-1deg);
  }
}
</style>
