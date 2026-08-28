<template>
  <LandingIndex />
</template>

<script setup lang="ts">
import LandingIndex from '../components/Landing/Index.vue'

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
  title: 'Werkbox — Practical work, connected',
  description:
    'Find practical jobs, skilled professionals, and the organisations that keep places running.',
})
</script>
