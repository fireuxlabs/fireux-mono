<template>
  <div class="min-h-full">
    <EffectsSteam />
    <MiseboxLandingIndex />
  </div>
</template>

<script setup lang="ts">
import { appMeta } from '../meta'
import MiseboxLandingIndex from '../components/Misebox/Landing/Index.vue'

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
