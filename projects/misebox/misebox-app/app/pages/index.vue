<template>
  <EffectsSteam />
  <LandingHeroSection />
  <div class="landing-index-divider">
    <USeparator
      :avatar="{
        src: '/img/app/logo.png',
        alt: 'Misebox',
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
  title: 'Misebox — Kitchen operations workspace',
  description:
    'A workspace for kitchens to manage daily operations, connect with professionals, and publish roles when you need to grow your team.',
})
</script>
