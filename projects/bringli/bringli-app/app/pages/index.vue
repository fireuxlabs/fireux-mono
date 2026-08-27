<template>
  <div class="min-h-full">
    <BringliLandingIndex />
  </div>
</template>

<script setup lang="ts">
import { appMeta } from '../meta'
import BringliLandingIndex from '../components/Bringli/Landing/Index.vue'

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
