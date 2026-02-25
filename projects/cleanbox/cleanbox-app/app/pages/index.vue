<template>
  <EffectsBubbles />
  <LandingHeroSection />
  <div class="landing-index-divider">
    <USeparator
      :avatar="{
        src: '/img/app/logo.png',
        alt: 'Cleanbox',
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
  title: 'Cleanbox — Cleaning operations you can trust',
  description: 'Schedule, verify, and invoice every clean with confidence.',
})
</script>
