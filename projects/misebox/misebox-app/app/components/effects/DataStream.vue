<template>
  <div class="data-streams">
    <div v-for="n in 20" :key="n" class="data-stream" />
  </div>
</template>

<script setup>
const { initializeStreams } = useDataStream()

onMounted(() => {
  initializeStreams()
})
</script>

<style scoped>
.data-streams {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: -1;
  pointer-events: none;
}

.data-stream {
  position: absolute;
  background: linear-gradient(
    to bottom,
    transparent,
    var(--ui-primary),
    transparent
  );
  color: var(--ui-primary);
  font-family: 'Courier New', monospace;
  font-size: 10px;
  line-height: 20px;
  text-align: center;
  writing-mode: vertical-lr;
  animation: stream infinite linear;
  border-radius: 1px;
  box-shadow: 0 0 10px var(--ui-primary);
}

@keyframes stream {
  0% {
    transform: translateY(-100vh);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(100vh);
    opacity: 0;
  }
}
</style>
