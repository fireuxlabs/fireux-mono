<template>
  <section class="landing-shell">
    <div class="landing-shell__grid">
      <div class="landing-shell__left">
        <slot name="left" />
      </div>
      <div class="landing-shell__right">
        <slot name="right" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({ name: 'NiederhornLandingShell' })
</script>

<style scoped>
.landing-shell {
  padding: clamp(2rem, 6vw, 4rem) 0;
}

.landing-shell__grid {
  display: grid;
  gap: clamp(2rem, 5vw, 4rem);
}

@media (min-width: 1024px) {
  .landing-shell__grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    align-items: center;
  }
}

.landing-shell__left,
.landing-shell__right {
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 3vw, 1.5rem);
}
</style>
