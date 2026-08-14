<template>
  <UPage class="friiites-page">
    <main id="top">
      <FriiitesHeroScene />
      <FriiitesMenuScene />
      <FriiitesOrderNowScene />
      <FriiitesFranchiseScene />
      <FriiitesMiseboxScene />
      <FriiitesFooterScene />
    </main>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'templates',
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
