<template>
  <EffectsLandingEffect />
  <LandingHeroSection />
  <div class="landing-index-divider">
    <USeparator
      :avatar="{
        src: '/img/app/logo.png',
        alt: 'Bringli',
      }"
      color="primary"
    />
  </div>

  <div class="landing-index-flow">
    <LandingGetStarted />
    <LandingProducts />
    <LandingApps />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
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
  title: 'Bringli | Local producer delivery',
  description:
    'Bringli is a local delivery marketplace for homes and businesses, starting with supplier operations powered by Drop.',
})
</script>
