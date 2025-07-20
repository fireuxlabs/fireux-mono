<template>
  <!-- Landing Background Effect -->
  <EffectsStarfield />

  <!-- Main Content -->
  <div class="page">
    <!-- Hero Component -->
    <LandingHero />

    <!-- Solutions Component -->
    <LandingSolutions />

    <!-- Skills Icons Component -->
    <LandingSkillsIcons />

    <!-- Products Component -->
    <LandingProducts />

    <!-- Fuel Component -->
    <LandingFuel />

    <!-- FireUX Features Component -->
    <LandingFireUX />
  </div>
</template>
<script setup>
// Simple SEO
useSeoMeta({
  title: 'FireUX - Vue.js Development Ecosystem',
  description:
    'Build faster with FireUX Core, manage data with Cleanbox, and deploy with Misebox.',
})

// No additional script needed - effect is handled by the component
</script>

<style scoped>
/* Let components handle their own spacing with Tailwind/NuxtUI utilities */
</style>
