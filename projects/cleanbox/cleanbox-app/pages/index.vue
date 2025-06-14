<script setup lang="ts"></script>

<template>
  <div class="page">
    <EffectsFloatingParticles />
    <FireLogoType size="hero" />
  </div>
</template>

<style scoped>
.page {
  gap: var(--space-16);
}
@media (min-width: 768px) {
  .page {
    gap: var(--space-24);
    max-width: 1000px;
  }
}
</style>
