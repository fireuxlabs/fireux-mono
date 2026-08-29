<template>
  <div class="min-h-full">
    <LandingHexagons />
    <LandingIndex />
  </div>
</template>

<script setup lang="ts">
import LandingIndex from '../components/Landing/Index.vue'
import { appMeta } from '../meta'

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
  title: appMeta.seoAbout.title,
  description: appMeta.seoAbout.description,
})
</script>
