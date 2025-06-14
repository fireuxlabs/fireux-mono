<script setup lang="ts">

</script>

<template>
  <div class="page">
    <EffectsStarfield />
    <FireLogoType size="hero" />
    <LandingHero />
    <LandingFireUX first />
    <LandingFuel />
    <LandingSkillsIcons />
    <LandingSolutions />
    <LandingFireUX second />
  </div>
</template>

<style scoped>
.page {
  gap: var(--space-12);
}
@media (min-width: 768px) {
  .page {
    gap: var(--space-20);
    max-width: 900px;
  }
}
</style>
