<template>
  <BaerenHome />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  nav: {
    key: 'home',
    label: 'Home',
    icon: 'i-lucide-house',
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
})

useSeoMeta({
  title: 'Hotel Bären Ringgenberg',
  description: 'Menu and venue information for Hotel Bären Ringgenberg.',
})
</script>
