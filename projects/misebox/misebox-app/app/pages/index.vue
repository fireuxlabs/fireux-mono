<template>
  <div class="page">
    <!-- Hero Component -->
    <LandingHero />

    <!-- Solutions Component -->
    <LandingSolutions />

    <!-- Integrations Component -->
    <LandingIntegrations />

    <!-- Features Component - First Set -->
    <LandingFeatures :first="true" />

    <!-- Features Component - Second Set -->
    <LandingFeatures :second="true" />

    <!-- Content from CMS (if available) -->
    <div v-if="page">
      <ContentRenderer :value="page" />
    </div>

    <!-- Call to Action -->
    <LandingCTA />
  </div>
</template>

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

<style scoped>
.page {
  /* Add any page-specific styles here */
}
</style>
