<template>
  <div class="stars" aria-hidden="true">
    <div class="stars__layer stars__layer--one" />
    <div class="stars__layer stars__layer--two" />
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'TenantEffectsStars' })
</script>

<style scoped>
.stars {
  inset: 0;
  position: absolute;
  pointer-events: none;
  overflow: hidden;
  z-index: -1;
}

.stars__layer {
  position: absolute;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.18) 0, transparent 55%)
    repeat;
  animation: drift 40s linear infinite;
  opacity: 0.35;
}

.stars__layer--two {
  animation-duration: 65s;
  opacity: 0.25;
}

@keyframes drift {
  0% {
    transform: translate3d(-20%, -20%, 0) scale(1);
  }
  50% {
    transform: translate3d(0%, 0%, 0) scale(1.05);
  }
  100% {
    transform: translate3d(20%, 20%, 0) scale(1);
  }
}
</style>
