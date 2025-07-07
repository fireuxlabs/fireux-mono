<template>
  <!-- Landing Background Effect -->
  <EffectsStarfield />

  <!-- Main Content -->
  <div class="min-h-screen relative z-10">
    <div class="landing-container">
      <!-- Hero Component -->
      <LandingHero />

      <!-- Solutions Component -->
      <div class="section-spacing">
        <LandingSolutions />
      </div>

      <!-- Skills Icons Component -->
      <div class="section-spacing">
        <LandingSkillsIcons />
      </div>

      <!-- Products Component -->
      <div class="section-spacing">
        here
        <LandingProducts />
      </div>

      <!-- Fuel Component -->
      <div class="section-spacing">
        <LandingFuel />
      </div>

      <!-- FireUX Features Component -->
      <div class="section-spacing">
        <LandingFireUX />
      </div>
    </div>
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
/* Landing Page Container */
.landing-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

/* Vertical breathing space between sections */
.section-spacing {
  margin-top: 4rem; /* 64px */
}

/* Mobile-first: no constraints, let components handle their own spacing */
@media (min-width: 1024px) {
  .landing-container {
    padding: 0 2rem;
  }

  /* More breathing space on desktop */
  .section-spacing {
    margin-top: 6rem; /* 96px */
  }
}
</style>
