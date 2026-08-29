<template>
  <div class="min-h-full">
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
  title: appMeta.seoHome.title,
  description: appMeta.seoHome.description,
})
</script>
