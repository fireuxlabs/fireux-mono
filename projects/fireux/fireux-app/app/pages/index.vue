<!-- Concurrent edit — 2026-07-23 12:13 CEST — FireUX landing makeover: adopt the shared product-led landing family. -->
<template>
  <EffectsStars />
  <FireUXLandingIndex />
</template>

<script setup lang="ts">
import { appMeta } from '../meta'
import FireUXLandingIndex from '../components/FireUX/Landing/Index.vue'

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
  title: appMeta.seoHome.title,
  description: appMeta.seoHome.description,
})
</script>
