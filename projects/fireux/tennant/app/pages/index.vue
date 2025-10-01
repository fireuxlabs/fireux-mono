<template>
  <div>
    <LandingHero />
    <LandingSolutions />
    <LandingFireUX />
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'default',
  nav: {
    key: 'home',
    label: 'Home',
    icon: 'i-lucide-home',
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
})
useSeoMeta({
  title: 'Tenant App',
  description: 'Tenant landing page',
})
</script>
