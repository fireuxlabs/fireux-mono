<template>
  <div class="page">
    <!-- Hero Component -->
    <LandingHero />

    <!-- Solutions Component -->
    <LandingSolutions />

    <!-- Features Component - First Set -->
    <LandingFeatures :first="true" />

    <!-- Features Component - Second Set -->
    <LandingFeatures :second="true" />

    <!-- Integrations Component -->
    <LandingIntegrations />

    <!-- Call to Action -->
    <LandingCTA />

    <!-- Content from CMS (if available) -->
    <div v-if="page">
      <ContentRenderer :value="page" />
    </div>
  </div>
</template>

<script setup>
// SEO and Meta
useSeoMeta({
  title: 'CleanBox - Professional Cleaning Business Management Platform',
  description:
    'Streamline your cleaning business with automated scheduling, client management, and secure payments. Grow your cleaning company with CleanBox.',
})

// Fetch the content for additional sections
const { data: page } = await useAsyncData('index', () =>
  queryCollection('content').path('/').first()
)
</script>

<style scoped>
/* Let components handle their own spacing with Tailwind/NuxtUI utilities */
</style>
