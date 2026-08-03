<template>
  <div class="min-h-full">
    <EffectsAmbient class="min-h-full">
      <!-- Steam effect parked for the current landing presentation.
      <template #effect>
        <EffectsSteam />
      </template>
      -->

      <MiseboxLandingIndex />
    </EffectsAmbient>
  </div>
</template>

<script setup lang="ts">
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
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

useAppLandingSeo({
  title: appMeta.seoHome.title,
  description: appMeta.seoHome.description,
  path: '/',
  image: '/img/landing/kitchen-operations-hero-v2.png',
  logo: '/img/app/logo.png',
  language: 'en',
})
</script>
