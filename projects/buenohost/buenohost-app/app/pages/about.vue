<template>
  <LandingIndex />
</template>

<script setup lang="ts">
import LandingIndex from '../components/Landing/Index.vue'

definePageMeta({
  layout: 'landing',
  nav: {
    key: 'about',
    label: 'About',
    icon: 'i-lucide-info',
    order: 25,
    position: 'bottom',
    desktop: true,
    mobile: true,
    layouts: ['landing'],
  },
})

useSeoMeta({
  title: 'About BuenoHost',
  description:
    'Publish digital guest guides and manage properties, reservations, and stay information from the Property Workspace.',
})
</script>
