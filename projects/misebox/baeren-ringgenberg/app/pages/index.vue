<template>
  <BaerenHomeHero />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'baeren-default',
  nav: {
    key: 'home',
    label: 'Home',
    icon: 'i-lucide-house',
    desktop: true,
    mobile: true,
    layouts: ['baeren-default'],
  },
})

useSeoMeta({
  title: 'Hotel Bären Ringgenberg',
  description: 'Menu and venue information for Hotel Bären Ringgenberg.',
})
</script>
