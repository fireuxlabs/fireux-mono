<!-- Concurrent edit — 2026-07-23 12:13 CEST — FireUX landing makeover: adopt the shared product-led landing family. -->
<template>
  <div class="min-h-full">
    <EffectsAmbient class="min-h-full">
      <template #effect>
        <EffectsStars />
      </template>

      <FireUXLandingIndex />
    </EffectsAmbient>
  </div>
</template>

<script setup lang="ts">
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
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

useAppLandingSeo({
  title: appMeta.seoHome.title,
  description: appMeta.seoHome.description,
  path: '/',
  image: '/img/app/cover.png',
  logo: '/img/app/logo.png',
})
</script>
