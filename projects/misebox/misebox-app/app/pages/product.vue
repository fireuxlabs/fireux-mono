<template>
  <div class="min-h-full">
    <EffectsAmbient class="min-h-full">
      <template #effect>
        <ClientOnly>
          <EffectsSteam />
        </ClientOnly>
      </template>

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
})

useAppLandingSeo({
  title: `Product · ${appMeta.name}`,
  description: appMeta.seoHome.description,
  path: '/product',
  image: '/img/landing/kitchen-operations-hero-v2.png',
  logo: '/img/app/logo.png',
  language: 'en',
})
</script>
