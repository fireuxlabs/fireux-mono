<template>
  <EffectsSteam />
  <LandingHeroSection />
  <USeparator
    :avatar="{
      src: '/img/app/logo.png',
    }"
    color="primary"
  />

  <LandingGetStarted />

  <USeparator
    :avatar="{
      src: '/img/app/logo.png',
    }"
    color="primary"
  />

  <LandingProducts />
  <LandingApps />
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
