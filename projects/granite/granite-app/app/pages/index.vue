<template>
  <EffectsStars />
  <LandingHeroSection />

  <div class="landing-index-divider">
    <USeparator
      :avatar="{
        src: '/img/app/logo.png',
        alt: 'Granite',
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
  title: 'Granite — Rock solid property portfolio control',
  description:
    'A branch console for structured oversight across client portfolios, properties, compliance, documents, and finance signals.',
})
</script>
