<template>
  <LandingHome />
</template>

<script setup lang="ts">
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'

definePageMeta({
  layout: 'landing',
  colorMode: 'light',
  nav: {
    key: 'home',
    label: 'Home',
    icon: 'i-lucide-home',
    order: 0,
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useAppLandingSeo({
  title: 'Yellow Velo · Independent bike shop in Interlaken',
  description:
    'Independent bike shop in Interlaken for vintage bicycles, adventure builds, rare components and considered cycling goods.',
  path: '/',
  image: '/img/yellow-velo/hero.png',
  logo: '/img/app/logo.png',
  language: 'en',
})
</script>
