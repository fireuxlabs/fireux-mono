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

    <!-- Reserved block for future CMS-driven content -->
    <!-- Temporarily removed ContentRenderer to avoid missing component warn -->
  </div>
</template>

<script setup>
// SEO and Meta
useSeoMeta({
  title: 'CleanBox - Professional Cleaning Business Management Platform',
  description:
    'Streamline your cleaning business with automated scheduling, client management, and secure payments. Grow your cleaning company with CleanBox.',
})

// CMS content temporarily disabled; bring back when Nuxt Content is wired
// const { data: page } = await useAsyncData('index', () =>
//   queryCollection('content').path('/').first()
// )
</script>

<style scoped>
/* Let components handle their own spacing with Tailwind/NuxtUI utilities */
</style>
