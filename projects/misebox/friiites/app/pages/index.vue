<template>
  <UPage class="friiites-page">
    <main id="top">
      <FriiitesHeroScene />
      <FriiitesProcessScene />
      <FriiitesProductScene />
      <FriiitesOrderingSurfacesScene />
      <FriiitesOrderJourneyScene />
      <FriiitesFranchiseScene />
      <FriiitesLocationsScene />
      <FriiitesFooterScene />
    </main>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'friiites',
  nav: {
    key: 'home',
    label: 'Home',
    icon: 'i-lucide-home',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'Friiites · Hand-cut, brined and triple-fried',
  description:
    'A fries place developed in Switzerland. Hand-cut, brined and triple-fried in beef tallow.',
})
</script>
