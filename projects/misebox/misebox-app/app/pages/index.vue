<script setup lang="ts">
// SEO and Meta
useSeoMeta({
  title: 'Misebox - Professional Kitchen Management Platform',
  description:
    'Master your culinary operations with digital recipe management, inventory control, and cost analysis. Built for chefs who demand precision.',
})

// Fetch the content for additional sections
const { data: page } = await useAsyncData('index', () =>
  queryCollection('content').path('/').first()
)
</script>

<template>
  <!-- Main Content -->
  <div class="min-h-screen relative z-10">
    <div class="landing-container">
      <!-- Hero Component -->
      <LandingHero />

      <!-- Solutions Component -->
      <div class="section-spacing">
        <LandingSolutions />
      </div>

      <!-- Integrations Component -->
      <div class="section-spacing">
        <LandingIntegrations />
      </div>

      <!-- Features Component - First Set -->
      <div class="section-spacing">
        <LandingFeatures :first="true" />
      </div>

      <!-- Features Component - Second Set -->
      <div class="section-spacing">
        <LandingFeatures :second="true" />
      </div>

      <!-- Tech Stack Component - Temporarily commented out -->
      <!-- <div class="section-spacing">
        <LandingTechStack />
      </div> -->

      <!-- Content from CMS (if available) -->
      <div v-if="page" class="section-spacing">
        <div class="content-section">
          <ContentRenderer :value="page" />
        </div>
      </div>

      <!-- Call to Action -->
      <div class="section-spacing">
        <LandingCTA />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Landing Page Container */
.landing-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

/* Vertical breathing space between sections */
.section-spacing {
  margin-top: 4rem; /* 64px */
}

/* Content Section from CMS */
.content-section {
  max-width: 800px;
  margin: 0 auto;
  text-align: left;
}

.content-section h1 {
  font-size: 3rem;
  font-weight: bold;
  color: var(--color-primary-500);
  text-align: center;
  margin-bottom: var(--space-6);
}

.content-section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-top: var(--space-6);
  margin-bottom: var(--space-3);
  color: var(--color-primary-600);
}

.content-section p {
  line-height: 1.6;
  margin-bottom: var(--space-4);
}

.content-section ul {
  margin-bottom: var(--space-4);
  padding-left: var(--space-6);
}

.content-section li {
  margin-bottom: var(--space-2);
  line-height: 1.6;
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
